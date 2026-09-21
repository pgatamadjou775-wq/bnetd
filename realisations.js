/*  Les grandes réalisations du BNETD — contenu des pages « Réalisations » de la tablette.

    Pour modifier un texte, un chiffre ou ajouter une réalisation, éditez ce fichier
    (n'importe quel éditeur de texte), enregistrez, puis rechargez la tablette.

    Pour ajouter des photos : copiez-les dans  public/assets/realisations/  puis ajoutez-les
    dans la liste « photos » de la réalisation (plusieurs photos = un diaporama qu'on fait défiler).
    Formats conseillés : JPG, 1600 px de large ou plus, moins de 400 Ko chacune.

    Champs de chaque réalisation
      id      identifiant court (sans espace)
      court   nom affiché sur l'écran d'accueil et sous la vignette
      detail  précision affichée sous le nom sur l'accueil (facultatif)
      nom     titre complet de la page
      lieu, categorie   petite ligne au-dessus du titre
      icone   pont | route | hopital | stade | universite
      intro   2 phrases de présentation
      chiffres  jusqu'à 4 repères : { v: valeur, l: libellé }
      role    ce que le BNETD a fait sur ce projet
      photos  { src, legende, alt }
      sources pages consultées pour rédiger les textes (non affichées à l'écran)

    À faire valider par le BNETD avant le salon : les textes ci-dessous ont été rédigés à partir
    des pages publiques listées dans « sources ».
*/
window.BNETD_REALISATIONS = [
  {
    id: 'pont-hkb',
    court: 'Pont HKB',
    detail: 'Abidjan',
    nom: 'Pont Henri Konan Bédié (HKB)',
    lieu: 'Abidjan · Riviera – Marcory',
    categorie: 'Ouvrage d’art',
    icone: 'pont',
    intro: 'Le troisième pont d’Abidjan franchit la lagune Ébrié entre la Riviera (Cocody) et Marcory. Il a révolutionné les déplacements quotidiens dans la capitale économique.',
    chiffres: [
      { v: 'Déc. 2014', l: 'Inauguration' },
      { v: '7 km', l: 'de viaduc et de voies d’accès' },
      { v: '80 000', l: 'véhicules par jour' },
      { v: '270 M€', l: 'coût total du projet' }
    ],
    role: 'Le BNETD était l’ingénieur du concédant : il a représenté l’État sur le plan technique, du suivi de la conception au contrôle des travaux.',
    photos: [
      { src: 'assets/realisations/pont-hkb-1.jpg', legende: 'L’aire de péage du pont', alt: 'Aire de péage du pont Henri Konan Bédié, vue du dessus' }
    ],
    sources: [
      'https://www.afdb.org/fr/projects-and-operations/selected-projects/hkb-bridge-a-revolution-for-urban-mobility-in-abidjan-134',
      'https://ageroute.ci/ageroute/realisations/103-voies-d-acces-a-l-hopital-general-d-angre-cocody',
      'http://initiative-ppp-afrique.com/Afrique-zone-franc/Pays-de-la-zone-franc/Cote-d-Ivoire/Pont-a-peage-Henri-Konan-Bedie'
    ]
  },
  {
    id: 'autoroute-grand-bassam',
    court: 'Autoroute Abidjan – Grand-Bassam',
    detail: '',
    nom: 'Voie express Abidjan – Grand-Bassam',
    lieu: 'Abidjan → Grand-Bassam',
    categorie: 'Infrastructure routière',
    icone: 'route',
    intro: 'Cette voie express à péage, à 2 × 3 voies, relie Abidjan à Grand-Bassam, ville classée au patrimoine mondial de l’UNESCO. Elle ouvre aussi la voie à la future autoroute Abidjan–Lagos.',
    chiffres: [
      { v: '2 × 3', l: 'voies' },
      { v: '71,6 Md', l: 'FCFA de coût du projet (TTC)' }
    ],
    role: 'Le contrôle des travaux a été assuré par le BNETD, pour le compte de l’AGEROUTE, maître d’ouvrage délégué de l’État.',
    photos: [
      { src: 'assets/realisations/autoroute-grand-bassam-1.jpg', legende: 'La voie express bordée de cocotiers', alt: 'Voie express Abidjan – Grand-Bassam bordée de palmiers' }
    ],
    sources: [
      'https://www.adolebatisseur.org/case_study/autoroute-abidjan-grand-bassam-2/',
      'https://ageroute.ci/index.php/ageroute/realisations/98-voie-express-abidjan-grand-bassam'
    ]
  },
  {
    id: 'hopital-moscati',
    court: 'Hôpital Moscati',
    detail: 'Yamoussoukro',
    nom: 'Hôpital Catholique Saint-Joseph Moscati',
    lieu: 'Yamoussoukro',
    categorie: 'Infrastructure de santé',
    icone: 'hopital',
    intro: 'Surnommé l’« hôpital-basilique », cet établissement à but non lucratif pratique des tarifs sociaux. Il a été construit par la Fondation Internationale Notre-Dame de la Paix et fonctionne avec les religieux Camilliens.',
    chiffres: [
      { v: 'Janv. 2015', l: 'Ouverture' },
      { v: '200', l: 'lits' },
      { v: '+ 20 000 m²', l: 'de superficie bâtie' }
    ],
    role: 'Mandaté par le gouvernement pour accélérer et achever le chantier, le BNETD a assuré le suivi et le contrôle des travaux jusqu’à la livraison de l’hôpital.',
    photos: [
      { src: 'assets/realisations/hopital-moscati-1.jpg', legende: 'La façade principale de l’hôpital', alt: 'Façade de l’hôpital catholique Saint-Joseph Moscati' }
    ],
    sources: [
      'https://moscati.org/index.php/hopital-fondation/',
      'https://news.abidjan.net/h/494181.html',
      'https://www.petitfute.com/v49138-yamoussou-kro/c1172-pense-fute-services/c1136-sante/c1137-lieu-de-soins/c857-hopital/1650637-hopital-catholique-saint-joseph-moscati.html'
    ]
  },
  {
    id: 'stade-ebimpe',
    court: 'Stade d’Ebimpé',
    detail: 'Anyama',
    nom: 'Stade Olympique d’Ebimpé',
    lieu: 'Anyama · Abidjan',
    categorie: 'Infrastructure sportive',
    icone: 'stade',
    intro: 'Surnommé le « nid d’oiseau d’Abidjan », ce stade de plus de 60 000 places est l’un des plus grands ouvrages sportifs d’Afrique de l’Ouest. Il a été construit avec la coopération chinoise.',
    chiffres: [
      { v: '60 012', l: 'places' },
      { v: 'Déc. 2016', l: 'Début des travaux' },
      { v: 'Oct. 2020', l: 'Inauguration' }
    ],
    role: 'Le BNETD a assuré le suivi et le contrôle externe des travaux pour l’État. Il a aussi été associé à l’étude de la future Cité Olympique d’Anyama-Ebimpé.',
    photos: [
      { src: 'assets/realisations/stade-ebimpe-1.jpg', legende: 'Vue d’artiste du stade', alt: 'Perspective aérienne du stade olympique d’Ebimpé' }
    ],
    sources: [
      'https://www.adolebatisseur.org/case_study/stade-olympique-ebimpe-anyama/',
      'https://marcopolis.net/bnetd-assistance-en-maitrise-d-ouvrages-et-maitrise-d-oeuvres-en-afrique.htm',
      'https://afrimag.net/cote-divoire-bientot-cite-olympique-autour-stade-danyama/',
      'https://mondialsport.ci/can-2023-le-stade-olympique-d-ebimpe-est-pret-a-77-bnetd-6552.sport'
    ]
  },
  {
    id: 'universite-man',
    court: 'Université de Man',
    detail: '',
    nom: 'Université de Man',
    lieu: 'Man · région du Tonkpi',
    categorie: 'Enseignement supérieur',
    icone: 'universite',
    intro: 'Créée en décembre 2015, l’université s’inscrit dans la décentralisation de l’enseignement supérieur. Elle forme aux métiers de l’agroforesterie, des mines et de la géologie, du tourisme, de l’énergie et de la mécanique.',
    chiffres: [
      { v: '113 ha', l: 'de terrain aménagé' },
      { v: '2 × 530', l: 'places en amphithéâtres' },
      { v: '20 000', l: 'étudiants à terme' }
    ],
    role: 'Le BNETD est le maître d’œuvre du campus et a contribué à élaborer le Programme de décentralisation des universités, qui comprend aussi Bondoukou, Adiaké et San-Pédro.',
    photos: [
      { src: 'assets/realisations/universite-man-1.jpg', legende: 'Vue aérienne du campus', alt: 'Vue aérienne du campus de l’université de Man' }
    ],
    sources: [
      'https://www.univ-man.edu.ci/',
      'https://emebci.com/references/15-universite-de-man.html',
      'https://connectionivoirienne.net/2021/01/17/les-travaux-de-luniversite-de-san-pedro-avancent/',
      'https://fr.allafrica.com/stories/202208050268.html',
      'https://dcf.ci/dcf.ci/construction-de-luniversite-de-man/'
    ]
  }
];
