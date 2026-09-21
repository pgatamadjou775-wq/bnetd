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
| `public/assets/realisations.js` | Le contenu des pages « Réalisations » : textes, chiffres, rôle du BNETD, photos (à modifier ici) |
| `public/assets/realisations/` | Les photos des réalisations |
| `public/assets/qrcode.js`, `contact-qr.js` | Fabrication du QR code de la carte de visite numérique (bibliothèque libre « qrcode-generator », licence MIT, incluse) |

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

## Les pages « Réalisations »

Sur l'écran d'accueil, chaque réalisation (Pont HKB, Autoroute Abidjan–Grand-Bassam,
Hôpital Moscati, Stade d'Ebimpé, Université de Man) est un bouton. Le visiteur le touche et
arrive sur une page **dans l'application** : photo, présentation, chiffres clés et **le rôle
du BNETD** sur le projet. Il passe d'une réalisation à l'autre avec les flèches, les vignettes
ou en glissant le doigt, et revient avec « Retour » ou « S'enregistrer ». Après 60 secondes sans
toucher l'écran, la tablette revient toute seule à l'accueil.

**Tout le contenu est dans `public/assets/realisations.js`** (un simple fichier texte, avec le
mode d'emploi en commentaire au début) :
- corriger un texte, un chiffre ou le rôle du BNETD ;
- **ajouter des photos** : copiez-les dans `public/assets/realisations/` et ajoutez une ligne dans
  la liste `photos` de la réalisation. Avec plusieurs photos, un diaporama apparaît
  automatiquement (flèches + points) ;
- ajouter une réalisation : copiez un bloc existant et changez ses champs.
Rechargez ensuite la page de la tablette.

**Photos :** les cinq photos fournies mesuraient environ 550 × 350 px, ce qui est petit pour une
tablette. Elles ont été agrandies et adoucies pour rester agréables, mais des originaux d'au moins
1600 px de large (JPG, moins de 400 Ko) seront nettement plus nets : remplacez simplement les
fichiers en gardant le même nom. Le stade est une vue d'artiste (perspective), pas une photo.

**À faire valider par le BNETD avant le salon.** Les textes ont été rédigés à partir de pages
publiques (la liste figure sous chaque réalisation, dans le champ `sources` de
`realisations.js`), pas de documents internes du BNETD. Vérifiez en particulier le **rôle du BNETD**
sur chaque projet et les chiffres :

| Réalisation | Rôle du BNETD affiché | Chiffres affichés |
|---|---|---|
| Pont HKB | Ingénieur du concédant (représentation technique de l'État) | Inauguré déc. 2014, 7 km de viaduc et voies d'accès, 80 000 véhicules/jour, 270 M€ |
| Autoroute Abidjan–Grand-Bassam | Contrôle des travaux, pour l'AGEROUTE | 2 × 3 voies, 71,6 Md FCFA (TTC) |
| Hôpital Moscati | Mandaté pour accélérer et achever le chantier, suivi et contrôle des travaux | Ouvert janv. 2015, 200 lits, plus de 20 000 m² |
| Stade d'Ebimpé | Suivi et contrôle externe des travaux ; associé à l'étude de la Cité Olympique | 60 012 places, travaux déc. 2016, inauguré oct. 2020 |
| Université de Man | Maître d'œuvre du campus ; contribution au Programme de décentralisation des universités | 113 ha, 2 × 530 places d'amphithéâtre, 20 000 étudiants à terme |

Les sources publiques ne donnent pas toujours le même chiffre (par exemple le coût de
l'autoroute varie d'une page à l'autre) : le BNETD a les chiffres de référence.

Les photos ne sont mises en mémoire par la tablette qu'une fois affichées ; si le serveur
tombe en plein salon, ouvrez chaque page une fois au préalable.

---

## La carte de visite numérique (QR code)

Dans **Réglages → Les commerciaux et la Direction**, saisissez pour chaque personne :
nom, fonction, **téléphone** et email (facultatif). Le Directeur Général s'ajoute
exactement de la même façon.

- Une personne avec un numéro affiche **« QR prêt »**. Le bouton **« Voir le QR »**
  montre le code tel que le visiteur le verra, et **« Télécharger le contact (.vcf) »**
  permet de l'essayer sur un ordinateur.
- Quand un visiteur choisit « Oui » à la carte de visite et sélectionne cette personne,
  l'écran « Merci » affiche son QR code. Le visiteur ouvre l'appareil photo de son
  téléphone, scanne, et touche « Ajouter aux contacts » : nom, fonction, société (BNETD),
  téléphone et email sont enregistrés d'un coup. Le numéro est converti au format
  international (`07 07 07 07 07` → `+225 07 07 07 07 07`) : il fonctionne même si le
  visiteur appelle depuis l'étranger.
- Le retour automatique à l'accueil passe à **45 secondes** (au lieu de 20) quand un QR
  est affiché, pour laisser le temps de scanner.
- Sans numéro (« Sans téléphone : pas de QR ») ou avec « Commercial disponible », il n'y a
  pas de QR : le visiteur voit le message habituel (« carte remise au stand »).
- Le bouton **Modifier** permet de compléter ou corriger une personne à tout moment ;
  les tablettes prennent le changement au plus tard 2 minutes après.

**À savoir :** le nom, la fonction, le téléphone et l'email des personnes *actives* sont
envoyés aux tablettes (c'est ce qui permet de fabriquer le QR, même sans réseau). Ne saisissez
que des coordonnées professionnelles destinées à être remises aux visiteurs, et désactivez
(« Actif ») ou supprimez une personne qui ne doit plus être proposée.

---

## Dépannage

- **« Impossible de contacter le serveur » / « Cette adresse ne fait tourner que des pages »**
  Le serveur (`server.js`) n'est pas en marche à cette adresse. Ce logiciel, comme
  l'invitation Grace & Benjamin, a besoin de `server.js` pour enregistrer les
  inscriptions et alimenter le back-office.
- **Ne fonctionne pas** : double-clic sur `admin.html` ou `index.html`, et hébergements
  de pages seules (Netlify Drop, GitHub Pages…). Les pages s'affichent, mais rien ne
  peut être enregistré ni lu.
- **Fonctionne** : `node server.js` sur un ordinateur (adresse `http://localhost:3000`),
  ou un hébergeur qui exécute Node.js (Render.com…).
- **« Identifiant ou mot de passe incorrect »** : identifiant `bnetd`, mot de passe
  `change-moi` par défaut, ou la valeur de `ADMIN_PASSWORD` si vous l'avez définie
  (le serveur doit avoir été relancé après).
- **Port déjà utilisé** : lancez avec un autre port (`PORT=3001 node server.js`).

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
- [ ] Commerciaux et Direction ajoutés dans Réglages, avec leur numéro de téléphone
- [ ] QR code de chaque personne testé avec un vrai téléphone (iPhone et Android si possible)
- [ ] Chaque tablette nommée (`?tablette=1`, `?tablette=2`…) et testée avec une fausse inscription
- [ ] Fausses inscriptions supprimées depuis le back-office
- [ ] Test coupure Wi-Fi : une inscription faite hors ligne arrive bien après retour du réseau
- [ ] Export CSV testé dans Excel
- [ ] Pages « Réalisations » relues et validées par le BNETD (rôle, chiffres, photos les plus nettes possibles)
