# Salon BNETD — Enregistrement des visiteurs sur tablette

Même principe que le logiciel de pointage et l'invitation Grace & Benjamin :
un petit serveur (`server.js`) qui sert les pages et enregistre tout dans un
fichier (`data.json`). Aucune dépendance à installer, aucun compte externe.

| Fichier | Rôle |
|---|---|
| `public/index.html` | L'écran des tablettes : accueil, formulaire, carte de visite, récapitulatif, merci |
| `public/admin.html` | Le back-office (mot de passe) : chiffres, affluence, liste, export CSV, réglages |
| `server.js` | Le serveur — sert les pages et gère les données |
| `data.json` | Les inscriptions (créé automatiquement au premier lancement) |
| `public/assets/` | Logos, photos et polices (tout est hébergé ici, rien ne dépend d'internet) |

```
Visiteur remplit le formulaire sur la tablette
        │
        ▼
Inscription mise à l'abri dans la tablette, puis envoyée à server.js
        │
        ▼
server.js écrit dans data.json  ◄──  admin.html lit et exporte
```

Si le Wi-Fi coupe, la tablette continue de fonctionner : les inscriptions
attendent dans la tablette et partent toutes seules dès que la connexion
revient (un compteur discret l'indique sur l'écran « Merci »). Il n'y a pas de
doublon possible si l'envoi est répété.

---

## Étape 1 — Choisir le mot de passe du back-office

Le mot de passe se règle par une variable d'environnement, sans toucher au code.

Sur Windows (PowerShell), avant de lancer le serveur :
```powershell
$env:ADMIN_PASSWORD = "votre-mot-de-passe"
node server.js
```
Sur Mac / Linux :
```bash
ADMIN_PASSWORD="votre-mot-de-passe" node server.js
```
L'identifiant par défaut est `bnetd` (changeable avec `ADMIN_USER`). Tant que le
mot de passe reste « change-moi », le serveur vous le rappelle au démarrage.

---

## Étape 2 — Lancer le serveur

Il faut [Node.js](https://nodejs.org) (version 18 ou plus) sur l'ordinateur.
```bash
node server.js
```
Le serveur affiche les adresses à utiliser :
```
Sur cet ordinateur :   http://localhost:3000
Sur les tablettes :    http://192.168.1.20:3000
Back-office :          …/admin.html
```

### Option recommandée pour le salon : un ordinateur portable sur place

1. Branchez l'ordinateur et les tablettes **sur le même Wi-Fi** (un petit routeur
   ou le partage de connexion d'un téléphone suffit — l'accès à internet n'est
   pas nécessaire).
2. Lancez `node server.js` sur l'ordinateur.
3. Sur chaque tablette, ouvrez l'adresse « Sur les tablettes ».
4. Vos données restent sur cet ordinateur, dans `data.json`.

### Option en ligne (Render.com ou autre hébergeur)

Possible aussi, mais attention : sur l'offre gratuite de Render, le disque est
**effacé à chaque redémarrage** et le serveur s'endort après quelques minutes
d'inactivité. Pour un salon, prenez une offre avec **disque persistant**, montez-le
(par exemple sur `/data`) et indiquez son chemin :
```
DATA_DIR=/data
ADMIN_PASSWORD=votre-mot-de-passe
```
Commande de démarrage : `node server.js`. Si vous restez sur l'offre gratuite,
exportez le CSV plusieurs fois par jour.

---

## Étape 3 — Préparer chaque tablette

Ouvrez l'adresse du serveur avec un petit complément dans le lien :

| Lien | Effet |
|---|---|
| `http://…:3000/?tablette=1` | Nomme la tablette « tablette_1 » (retenu ensuite ; sert aux statistiques) |
| `http://…:3000/?tablette=2&kiosque=1` | Nom + passage en plein écran au premier appui sur « S'enregistrer » |

Puis, dans le navigateur, « Ajouter à l'écran d'accueil » pour avoir une icône
BNETD. Pour empêcher les visiteurs de quitter la page, activez le mode
« accès guidé » (iPad) ou l'épinglage d'écran (Android).

**Espace équipe sur la tablette** : touchez 5 fois de suite le logo de l'écran
d'accueil. Vous y voyez l'état du serveur, le nombre d'inscriptions en attente
d'envoi, vous pouvez renommer la tablette, passer en plein écran ou ouvrir le
back-office. Les visiteurs ne le voient pas.

**Inactivité** : après 90 secondes sans toucher l'écran, la tablette demande
« Êtes-vous toujours là ? ». Sans réponse sous 15 secondes, elle efface le
formulaire et revient à l'accueil — les données d'un visiteur ne restent jamais
affichées pour le suivant.

---

## Étape 4 — Le back-office

Ouvrez `…/admin.html` et connectez-vous.

- **Chiffres clés** : total, aujourd'hui, cartes de visite demandées, dernière inscription.
- **Répartition par catégorie** et **affluence** (par heure pour un jour choisi, ou par jour).
- **Liste** : recherche (nom, téléphone, société, email), filtres par catégorie,
  commercial (dont « Sans carte » et « Carte à attribuer »), tablette et dates.
- **Export CSV** : s'ouvre directement dans Excel avec les accents corrects.
- **Clic sur une ligne** : détail complet, avec possibilité de supprimer (deux clics).
- **Réglages** : nom, lieu et dates du salon ; ajout, désactivation et suppression
  des commerciaux proposés aux visiteurs.

Ajoutez vos commerciaux **avant l'ouverture** : sans commercial actif, le visiteur
se voit proposer « Commercial disponible » et la carte apparaît « à attribuer »
dans la liste.

---

## Sécurité et données

- Le back-office est protégé par mot de passe (avec limitation des tentatives).
- Seuls les fichiers du dossier `public/` sont accessibles depuis le navigateur.
- `data.json` est écrit de façon sûre (fichier temporaire puis remplacement) et une
  copie `data.json.bak` est conservée ; en cas de fichier abîmé, le serveur repart
  de la sauvegarde.
- Chaque visiteur coche un consentement avant l'envoi. Pensez à supprimer ou
  anonymiser les données une fois la relance commerciale terminée.
- Faites une **copie de `data.json` et un export CSV en fin de journée**.

---

## Avant le jour J — liste de contrôle

- [ ] Mot de passe admin changé
- [ ] Dates et lieu du salon vérifiés dans Réglages
- [ ] Commerciaux ajoutés dans Réglages
- [ ] Chaque tablette nommée (`?tablette=1`, `?tablette=2`…) et testée avec une fausse inscription
- [ ] Fausses inscriptions supprimées depuis le back-office
- [ ] Test coupure Wi-Fi : une inscription faite hors ligne arrive bien après retour du réseau
- [ ] Export CSV testé dans Excel
