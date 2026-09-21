/**
 * Salon BNETD — petit serveur
 *
 * Même principe que le logiciel de pointage et l'invitation Grace & Benjamin :
 * aucun service externe, aucune dépendance à installer. Ce fichier sert les
 * pages du dossier public/ ET enregistre les inscriptions dans data.json.
 *
 * Lancement :  node server.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

/* ------------------------------------------------------------------ */
/*  RÉGLAGES — à changer avant le salon                                */
/* ------------------------------------------------------------------ */

const PORT = Number(process.env.PORT) || 3000;

// Identifiants du back-office (admin.html).
// Vous pouvez les définir ici, ou (mieux) via les variables d'environnement
// ADMIN_USER et ADMIN_PASSWORD sur votre hébergeur.
const ADMIN_USER = process.env.ADMIN_USER || 'bnetd';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-moi';

// Dossier où data.json est enregistré. Par défaut : à côté de server.js.
// Sur un hébergeur avec disque persistant, mettez son chemin dans DATA_DIR.
const DATA_DIR = process.env.DATA_DIR || __dirname;

// Valeurs de départ du salon. Ensuite, tout se modifie depuis le back-office
// (bouton « Réglages »), sans toucher à ce fichier.
const SALON_PAR_DEFAUT = {
  nom: 'Africa Space Expo',
  lieu: 'Parc des Expositions d’Abidjan',
  debut: '2026-09-24',
  fin: '2026-09-26'
};

const CATEGORIES = [
  { code: 'etudiant_stage', libelle: 'Étudiant(e) – recherche de stage' },
  { code: 'etudiant_autre', libelle: 'Étudiant(e) – autres' },
  { code: 'chef_entreprise', libelle: 'Chef d’entreprise' },
  { code: 'representant_entreprise', libelle: 'Représentant d’entreprise / Responsable' },
  { code: 'partenaire', libelle: 'Partenaire potentiel' },
  { code: 'client', libelle: 'Client potentiel' },
  { code: 'presse', libelle: 'Presse / Média' },
  { code: 'autre', libelle: 'Autre' }
];

/* ------------------------------------------------------------------ */
/*  DONNÉES                                                            */
/* ------------------------------------------------------------------ */

const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

let db = { salon: { ...SALON_PAR_DEFAUT }, commerciaux: [], inscriptions: [] };
const idsConnus = new Set();

function charger() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const candidats = [DATA_FILE, DATA_FILE + '.bak'];
  for (const f of candidats) {
    if (!fs.existsSync(f)) continue;
    try {
      const d = JSON.parse(fs.readFileSync(f, 'utf8'));
      db = {
        salon: { ...SALON_PAR_DEFAUT, ...(d.salon || {}) },
        commerciaux: Array.isArray(d.commerciaux) ? d.commerciaux : [],
        inscriptions: Array.isArray(d.inscriptions) ? d.inscriptions : []
      };
      if (f !== DATA_FILE) console.warn('⚠ data.json illisible — données rechargées depuis la sauvegarde ' + path.basename(f));
      break;
    } catch (e) {
      const copie = f + '.corrompu-' + Date.now();
      try { fs.copyFileSync(f, copie); } catch (_) { /* ignore */ }
      console.error('⚠ ' + path.basename(f) + ' est illisible (copie conservée : ' + path.basename(copie) + ')');
    }
  }
  db.inscriptions.forEach(i => idsConnus.add(i.id));
  sauvegarder();
}

// Écriture « atomique » : on écrit un fichier temporaire, on garde l'ancienne
// version en .bak, puis on remplace. Une coupure de courant ne corrompt rien.
function sauvegarder() {
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  if (fs.existsSync(DATA_FILE)) fs.copyFileSync(DATA_FILE, DATA_FILE + '.bak');
  fs.renameSync(tmp, DATA_FILE);
}

/* ------------------------------------------------------------------ */
/*  OUTILS                                                             */
/* ------------------------------------------------------------------ */

const txt = (v, max) =>
  String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const txtLong = (v, max) =>
  String(v == null ? '' : v).replace(/\r/g, '').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').trim().slice(0, max);
const dateOk = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + 'T12:00:00'));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function json(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(JSON.stringify(obj));
}
function send(res, code, texte) {
  res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(texte);
}

function lireCorps(req, limite = 100000) {
  return new Promise((resolve, reject) => {
    let corps = '';
    req.on('data', c => {
      corps += c;
      if (corps.length > limite) { reject(Object.assign(new Error('trop gros'), { code: 413 })); req.destroy(); }
    });
    req.on('end', () => {
      try { resolve(corps ? JSON.parse(corps) : {}); }
      catch (e) { reject(Object.assign(new Error('json invalide'), { code: 400 })); }
    });
    req.on('error', reject);
  });
}

// Limitation simple du nombre de requêtes (contre les abus)
const compteurs = new Map();
function depasse(cle, max, fenetreMs, incrementer = true) {
  const t = Date.now();
  let c = compteurs.get(cle);
  if (!c || t > c.fin) { c = { n: 0, fin: t + fenetreMs }; compteurs.set(cle, c); }
  if (incrementer) c.n++;
  return c.n > max;
}
setInterval(() => {
  const t = Date.now();
  for (const [k, c] of compteurs) if (t > c.fin) compteurs.delete(k);
}, 60000).unref();

const ipDe = req => (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '?';

function egal(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function verifierAdmin(req, res) {
  const ip = ipDe(req);
  if (depasse('echec:' + ip, 10, 60000, false)) {
    json(res, 429, { ok: false, erreur: 'Trop de tentatives. Réessayez dans une minute.' });
    return false;
  }
  const h = req.headers['authorization'] || '';
  if (h.startsWith('Basic ')) {
    const [u, ...reste] = Buffer.from(h.slice(6), 'base64').toString('utf8').split(':');
    if (egal(u, ADMIN_USER) && egal(reste.join(':'), ADMIN_PASSWORD)) return true;
  }
  depasse('echec:' + ip, 10, 60000);
  json(res, 401, { ok: false, erreur: 'Identifiant ou mot de passe incorrect' });
  return false;
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

function commerciauxPublics() {
  return db.commerciaux.filter(c => c.actif).map(c => ({ id: c.id, nom: c.nom, fonction: c.fonction || '' }));
}

function creerInscription(b) {
  const id = txt(b.id, 64) || crypto.randomUUID();
  if (idsConnus.has(id)) return { ok: true, id, doublon: true };

  const erreurs = [];
  const nom = txt(b.nom_complet, 120);
  const telephone = txt(b.telephone, 30).replace(/[^\d+\-().\s]/g, '');
  const email = txt(b.email, 120).toLowerCase();
  const cat = CATEGORIES.find(c => c.code === b.categorie);
  if (nom.length < 2) erreurs.push('nom_complet');
  if (telephone.replace(/\D/g, '').length < 8) erreurs.push('telephone');
  if (email && !EMAIL_RE.test(email)) erreurs.push('email');
  if (!cat) erreurs.push('categorie');
  if (b.consentement !== true) erreurs.push('consentement');
  if (erreurs.length) return { ok: false, erreurs };

  // Heure d'inscription : celle de la tablette si elle est plausible
  // (utile quand l'envoi a été retardé par une coupure de connexion).
  const maintenant = Date.now();
  let quand = new Date(b.cree_le);
  if (isNaN(quand) || quand.getTime() > maintenant + 10 * 60000 || quand.getTime() < maintenant - 7 * 86400000) {
    quand = new Date(maintenant);
  }

  const veutCarte = b.carte_visite === true;
  let commercialId = '';
  let commercialNom = '';
  if (veutCarte) {
    const c = db.commerciaux.find(x => x.id === txt(b.commercial_id, 40));
    if (c) { commercialId = c.id; commercialNom = c.nom; }
  }

  db.inscriptions.unshift({
    id,
    horodatage: quand.toISOString(),
    recu_le: new Date(maintenant).toISOString(),
    tablette: txt(b.tablette, 40) || 'tablette_1',
    nom_complet: nom,
    telephone,
    email,
    categorie: cat.code,
    societe: txt(b.societe, 160),
    commentaires: txtLong(b.commentaires, 2000),
    carte_visite: veutCarte,
    commercial_id: commercialId,
    commercial_nom: commercialNom,
    consentement: true
  });
  idsConnus.add(id);
  sauvegarder();
  return { ok: true, id };
}

async function api(req, res, p) {
  const m = req.method;
  const ip = ipDe(req);

  if (p === '/api/sante' && m === 'GET') {
    return json(res, 200, { ok: true, inscriptions: db.inscriptions.length });
  }

  // ---- Public : réglages affichés sur les tablettes ----
  if (p === '/api/config' && m === 'GET') {
    return json(res, 200, { salon: db.salon, categories: CATEGORIES, commerciaux: commerciauxPublics() });
  }

  // ---- Public : un visiteur envoie son inscription ----
  if (p === '/api/inscriptions' && m === 'POST') {
    if (depasse('insc:' + ip, 120, 60000)) return json(res, 429, { ok: false, erreur: 'Trop de requêtes' });
    let corps;
    try { corps = await lireCorps(req); }
    catch (e) { return json(res, e.code || 400, { ok: false, erreur: 'Requête invalide' }); }
    const r = creerInscription(corps);
    return json(res, r.ok ? 200 : 400, r);
  }

  // ---- Tout ce qui suit demande le mot de passe admin ----
  if (!verifierAdmin(req, res)) return;

  if (p === '/api/auth' && m === 'GET') return json(res, 200, { ok: true });

  if (p === '/api/admin' && m === 'GET') {
    return json(res, 200, {
      salon: db.salon,
      categories: CATEGORIES,
      commerciaux: db.commerciaux,
      inscriptions: db.inscriptions
    });
  }

  let mm;
  if ((mm = p.match(/^\/api\/inscriptions\/([\w-]{1,64})$/)) && m === 'DELETE') {
    const i = db.inscriptions.findIndex(x => x.id === mm[1]);
    if (i < 0) return json(res, 404, { ok: false, erreur: 'Introuvable' });
    db.inscriptions.splice(i, 1);
    idsConnus.delete(mm[1]);
    sauvegarder();
    return json(res, 200, { ok: true });
  }

  if (p === '/api/salon' && m === 'PUT') {
    let b; try { b = await lireCorps(req); } catch (e) { return json(res, e.code || 400, { ok: false, erreur: 'Requête invalide' }); }
    const nom = txt(b.nom, 120);
    const lieu = txt(b.lieu, 160);
    if (!nom) return json(res, 400, { ok: false, erreur: 'Le nom du salon est obligatoire' });
    if (!dateOk(b.debut) || !dateOk(b.fin) || b.fin < b.debut) {
      return json(res, 400, { ok: false, erreur: 'Dates invalides' });
    }
    db.salon = { nom, lieu, debut: b.debut, fin: b.fin };
    sauvegarder();
    return json(res, 200, { ok: true, salon: db.salon });
  }

  if (p === '/api/commerciaux' && m === 'POST') {
    let b; try { b = await lireCorps(req); } catch (e) { return json(res, e.code || 400, { ok: false, erreur: 'Requête invalide' }); }
    const nom = txt(b.nom, 100);
    if (nom.length < 2) return json(res, 400, { ok: false, erreur: 'Le nom est obligatoire' });
    const c = { id: 'c_' + crypto.randomBytes(4).toString('hex'), nom, fonction: txt(b.fonction, 100), actif: true };
    db.commerciaux.push(c);
    sauvegarder();
    return json(res, 200, { ok: true, commercial: c });
  }

  if ((mm = p.match(/^\/api\/commerciaux\/([\w-]{1,40})$/))) {
    const c = db.commerciaux.find(x => x.id === mm[1]);
    if (!c) return json(res, 404, { ok: false, erreur: 'Introuvable' });
    if (m === 'PATCH') {
      let b; try { b = await lireCorps(req); } catch (e) { return json(res, e.code || 400, { ok: false, erreur: 'Requête invalide' }); }
      if (typeof b.actif === 'boolean') c.actif = b.actif;
      if (typeof b.nom === 'string' && txt(b.nom, 100).length >= 2) c.nom = txt(b.nom, 100);
      if (typeof b.fonction === 'string') c.fonction = txt(b.fonction, 100);
      sauvegarder();
      return json(res, 200, { ok: true, commercial: c });
    }
    if (m === 'DELETE') {
      db.commerciaux = db.commerciaux.filter(x => x.id !== c.id);
      sauvegarder();
      return json(res, 200, { ok: true });
    }
  }

  return json(res, 404, { ok: false, erreur: 'Route inconnue' });
}

/* ------------------------------------------------------------------ */
/*  PAGES ET FICHIERS STATIQUES (uniquement le dossier public/)        */
/* ------------------------------------------------------------------ */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function statique(req, res, p) {
  let rel;
  try { rel = decodeURIComponent(p); } catch (e) { return send(res, 400, 'Requête invalide'); }
  if (rel === '/' || rel === '') rel = '/index.html';
  if (rel === '/admin') rel = '/admin.html';
  const fichier = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!fichier.startsWith(PUBLIC_DIR + path.sep)) return send(res, 403, 'Interdit');

  fs.stat(fichier, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'Introuvable');
    const ext = path.extname(fichier).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': st.size,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff'
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(fichier).pipe(res);
  });
}

/* ------------------------------------------------------------------ */
/*  DÉMARRAGE                                                          */
/* ------------------------------------------------------------------ */

const serveur = http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (pathname.startsWith('/api/')) return await api(req, res, pathname);
    if (req.method === 'GET' || req.method === 'HEAD') return statique(req, res, pathname);
    send(res, 405, 'Méthode non autorisée');
  } catch (e) {
    console.error(e);
    if (!res.headersSent) json(res, 500, { ok: false, erreur: 'Erreur du serveur' });
    else res.end();
  }
});

function adressesLocales() {
  const out = [];
  for (const liste of Object.values(os.networkInterfaces())) {
    for (const i of liste || []) if (i.family === 'IPv4' && !i.internal) out.push(i.address);
  }
  return out;
}

charger();
serveur.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  Salon BNETD — serveur démarré');
  console.log('  Sur cet ordinateur :   http://localhost:' + PORT);
  adressesLocales().forEach(a => console.log('  Sur les tablettes :    http://' + a + ':' + PORT));
  console.log('  Back-office :          …/admin.html');
  console.log('  Inscriptions déjà enregistrées : ' + db.inscriptions.length);
  if (ADMIN_PASSWORD === 'change-moi') {
    console.log('');
    console.log('  ⚠ Le mot de passe admin est encore « change-moi » : changez-le avant le salon.');
  }
  console.log('');
});
