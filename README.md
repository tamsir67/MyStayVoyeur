# 🌲 MyStay Voyager — Plateforme de Tourisme Rural & Éco-responsable

<p align="center">
  <img src="/logo.jpg" alt="Logo Officiel My Stay Voyager - MSV -" width="180" style="border-radius: 50%; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" />
</p>

<p align="center">
  <strong>MY STAY &bull; VOYAGER &bull; MSV</strong><br />
  <em>L’alternative responsable et durable au tourisme de masse dans les territoires ruraux français.</em>
</p>

---

## 📖 Sommaire
1. [Identité Visuelle & Logo Officiel](#-identité-visuelle--logo-officiel)
2. [Journal des Modifications (Changelog de Référence)](#-journal-des-modifications-changelog-de-référence)
3. [À Propos de MyStay](#-à-propos-de-mystay)
4. [Manuel d'Utilisation : Guide Complet & Pas-à-Pas](#-manuel-dutilisation--guide-complet--pas-à-pas)
   - [Profil & Avatar de Ba Tamsir (Mode Démo)](#1-profil--avatar-de-ba-tamsir-mode-démo)
   - [Authentification & Sécurisation des Espaces](#2-authentification--sécurisation-des-espaces)
   - [Manuel Utilisateur Voyageur](#3-manuel-utilisateur-voyageur)
   - [Manuel Utilisateur Hôte Rural](#4-manuel-utilisateur-hôte-rural)
   - [Manuel Administrateur & Console CMS (CRUD Global)](#5-manuel-administrateur--console-cms-crud-global)
   - [Foire Aux Questions (FAQ) & Guide de Dépannage](#6-foire-aux-questions-faq--guide-de-dépannage)
5. [Architecture & Démarrage Développeur](#-architecture--démarrage-développeur)
   - [Option 1 : Base Persistante Serveur Autonome (Active & Recommandée)](#1-option-1--base-persistante-serveur-autonome-active--recommandée)
   - [Structure Full-Stack Découplée](#2-structure-full-stack-découplée)
   - [Messagerie Instantanée Temps Réel (Protocole WebSocket)](#3-messagerie-instantanée-temps-réel-protocole-websocket)
   - [Configuration Supabase (PostgreSQL Cloud Optionnel)](#4-configuration-supabase-postgresql-cloud-optionnel)
   - [Panneau de Diagnostic & Interconnexion en Direct](#5-panneau-de-diagnostic--interconnexion-en-direct)
   - [Export & Synchronisation GitHub](#6-export--synchronisation-github)
6. [Protocole de Maintenance du README](#-protocole-de-maintenance-du-readme)
7. [Support & Contact](#-support--contact)

---

## 🎨 Identité Visuelle & Logo Officiel

La plateforme adopte l'emblème officiel **MY STAY VOYAGER (MSV)** :

### 1. Symbolique de l'Emblème
- **Cimes enneigées (Montagnes)** : Symbolise la préservation des grands espaces préservés et la majesté des massifs français (Cévennes, Alpes, Pyrénées, Massif Central).
- **Forêt de résineux (Pins & Sapins)** : Rappelle l'engagement indéfectible envers la biodiversité, les 3 critères éco-responsables obligatoires par hébergement et la reforestation.
- **Rivières & Flots purs** : Évoque les cours d'eau vivants, la sobriété hydrique et le ressourcement au cœur de la nature.
- **Soleil d'or & Ciel azur** : Représente l'accueil chaleureux des terroirs et l'énergie renouvelable.
- **Typographie Officielle** :
  - `MY STAY` : Lettrage display bold en bleu ardoise profond (`#24587C`).
  - `VOYAGER - M S V -` : Sous-titre espacé et aéré (`#3D7C9F`).

### 2. Implémentation dans la Plateforme
- **Composant réutilisable** : `src/components/LogoMyStayVoyager.tsx`
- **Déclinaisons disponibles** :
  - `horizontal` : Utilisé dans la **Navbar** sticky avec typographie alignée et badge "Rural & Durable".
  - `badge` : Utilisé comme sceau circulaire dans le **Hero de présentation** et pour les avatars compacts.
  - `footer` : Optimisé pour le fond sombre du pied de page avec contraste renforcé (`#E8EDEA`).
  - `full` : Emblème centré avec sous-titres superposés.
- **Assets physiques** :
  - Fichier image principal : `/public/logo.jpg` (et `/public/assets/logo_mystay_voyager.jpg`).
  - Favicon & Apple Touch Icon : déclarés dans `index.html`.
  - Fallback vectoriel SVG inline : assure un rendu net et infini même en cas de coupure réseau.

---

## 📝 Journal des Modifications (Changelog de Référence)

Ce journal consigne de manière exhaustive chaque modification apportée à la plateforme MyStay.

### [v2.3.0] — 23 Septembre 2026 : Publication Image du Site & Vidéo Immersion de l'Accueil Voyageur
- **Espace « Déposer une annonce rurale » (Assistant Hôte Étape 4)** :
  - **📸 Image Principale du Site d'Accueil (Où le voyageur sera accueilli)** :
    - Mise en place d'un bloc dédié avec aperçu haute fidélité au format 16/9 ou 21/9.
    - Badge explicatif en surimpression : *« Vue du site où le voyageur sera accueilli »*.
    - Options complètes pour l'hôte : téléversement de fichier photo local (glisser-déposer / sélection de fichier), saisie d'URL d'image ou sélection en 1 clic parmi une bibliothèque de sites ruraux authentiques (Mas cévenol, Moulin d'eau, Éco-cabane, Bergerie, Ferme maraîchère, etc.).
    - Gestion fluide de la galerie secondaire pour les photos complémentaires intérieures (chambres, pièce de vie, sanitaires).
  - **🎬 Vidéo de Présentation du Site & de l'Accueil Voyageur (Recommandé)** :
    - Zone explicative invitant l'hôte à ajouter une vidéo pour faire découvrir le site en mouvement, les extérieurs et l'ambiance du domaine.
    - Support universel : Liens YouTube (`watch?v=` ou `youtu.be`), vidéos Vimeo ou liens directs MP4/WebM.
    - Prise en charge du téléversement direct de fichiers vidéo locaux (< 25 Mo) avec encodage instantané pour prévisualisation.
    - Boutons d'exemples de vidéos rurales en 1 clic (*« Visite mas en pleine nature »*, *« Vue drone du domaine »*).
    - **Lecteur vidéo interactif en direct intégré dans la modale** : permet à l'hôte de lancer et tester immédiatement la vidéo avant de soumettre son annonce.
- **Expérience Voyageur & Fiches Hébergements (`ListingDetailModal.tsx` & `ListingCard.tsx`)** :
  - Bannière d'accueil personnalisée : *« 🏡 Le site où vous serez accueilli par [Nom de l'hôte] : découvrez la propriété, les abords naturels et l'ambiance authentique »*.
  - Onglets médias harmonisés : *« 📸 Photos du site ([N]) »* et *« 🎬 Vidéo du site & accueil »*.
  - Bouton flottant d'appel à l'immersion sur la photo grand format : *« Voir la vidéo du site d'accueil »*.
  - Badge visuel sur les cartes gîtes : *« 🎬 Vidéo du site »*.

### [v2.2.0] — 23 Septembre 2026 : Messagerie Instantanée Temps Réel (WebSocket) Hôte-Voyageur & Visite Vidéo Immersion Terroir
- **Messagerie Instantanée Temps Réel (WebSocket Natif)** :
  - **Serveur WebSocket Dédié (`/ws/chat`)** :
    - Mise en place du module serveur `server/chatSocket.ts` attaché à l'instance HTTP Express (port 3000).
    - Protocole d'échange bidirectionnel temps réel avec événements typés :
      - `auth` : Authentification immédiate de la session avec transmission de l'identité et du rôle.
      - `join_booking` : Abonnement à la salle d'échange dédiée à une réservation ou une demande d'information.
      - `send_message` : Diffusion instantanée sans latence à tous les participants connectés de la conversation.
      - `typing` : Indicateur de saisie en direct transmis entre interlocuteurs avec extinction automatique après 1,5s.
      - `presence` : Synchronisation en direct de l'annuaire des utilisateurs connectés.
      - `ping` / `pong` : Système de heartbeat garantissant le maintien des connexions même en cas de veille réseau.
  - **Client WebSocket Résilient (`src/services/chatSocketClient.ts`)** :
    - Gestionnaire client autonome avec stratégie de reconnexion automatique exponentielle (1s à 10s).
    - Détection de reprise réseau (`window.addEventListener('online')`) et relance de négociation immédiate.
    - Souscriptions par callbacks découplés pour le statut, les messages, la saisie et la présence.
  - **Interface Utilisateur Moderne & Ergonomique (`MessagingModal.tsx`)** :
    - **Volet latéral multi-conversations (desktop)** : Liste des fils de discussion avec aperçu du dernier message et pastilles de présence.
    - **Indicateur de statut en direct** : Badge pulsé « 🟢 En direct » ou « ⚪ Hors-ligne » indiquant la disponibilité immédiate de l'interlocuteur.
    - **Indicateur de frappe animé** : Notification visuelle « *[Nom] est en train d'écrire...* » en direct.
    - **Boutons de réponses rapides contextualisés** :
      - *Pour l'hôte* : Code de boîte à clés sécurisé, consignes d'accès & itinéraire, proposition de panier du terroir.
      - *Pour le voyageur* : Confirmation d'heure d'arrivée, demande de stationnement, conseils randos et producteurs locaux.
    - **Notifications sonores & visuelles** : Carillon discret via Web Audio API et bannières toast lors de la réception d'un message en arrière-plan.
    - **Défilement automatique** : Ancrage visuel fluide vers le message le plus récent.
  - **Multiples Points d'Entrée Directs** :
    - Icône de messagerie dans la barre de navigation supérieure (`Navbar.tsx`) avec badge animé du nombre de messages non lus.
    - Boutons **« Contacter l'hôte en direct »** et **« Poser une question à l'hôte »** intégrés sur la fiche détaillée du gîte (`ListingDetailModal.tsx`).
    - Bouton d'accès depuis le tableau de bord des réservations voyageur (`TravelerTripsView.tsx`).
    - Raccourci vers la messagerie en direct dans l'Espace Hôte (`HostDashboard.tsx`).
  - **Persistance Triple & Idempotence** :
    - Fichier local serveur persistant `data/messages.json`.
    - Table relationnelle cloud Supabase `public.messages`.
    - Déduplication côté client garantissant l'intégrité de l'historique sans messages en double.

- **Intégration des Visites Vidéo & Immersion Terroir (YouTube / Vimeo / MP4)** :
  - **Dépôt d'Annonce Hôte Rural (`HostDashboard.tsx`)** :
    - Prise en charge d'un champ URL de visite vidéo dès la création ou la modification d'un hébergement.
    - Support universel : liens YouTube (standards et raccourcis `youtu.be`), vidéos Vimeo et fichiers vidéo MP4/WebM hébergés.
    - Suggestions de vidéos terroirs intégrées pour tester l'immersion (paysages cévenols, rucher bio, mas provençal).
  - **Fiche Détaillée & Lecteur Immersif (`ListingDetailModal.tsx`)** :
    - Onglet média à double vue : bascule instantanée entre **« Photos du gîte »** et **« Visite vidéo »**.
    - Lecteur vidéo responsive avec intégration iframe sécurisée (YouTube Embed / Vimeo Player) et balise HTML5 native avec contrôles interactifs.
    - Badge distinctif « 🎬 Visite vidéo disponible » sur les cartes de résultats pour guider les voyageurs vers les annonces enrichies.
  - **Console CMS Admin (`AdminCMSPanel.tsx`)** :
    - Possibilité pour l'administrateur de modérer, ajouter ou mettre à jour le lien vidéo de n'importe quel gîte du catalogue.

### [v2.0.0] — 21 Septembre 2026 : Option 1 — Base Persistante Serveur Découplée & Gestion Haute Résolution des Profils et Photos
- **Activation de l'Option 1 : Base Persistante Serveur Autonome (`/data/`)** :
  - Mise en place d'un moteur de persistance disque côté serveur Express dans le répertoire `/data/` :
    - `data/users.json` : Profils utilisateurs, photos d'avatar haute résolution, coordonnées, rôles et mots de passe.
    - `data/bookings.json` : Réservations avec dates, voyageurs, montants totaux, codes d'accès sécurisés et bilans carbone.
    - `data/listings.json` : Hébergements ruraux éco-responsables, détails du terroir, labels et équipements.
    - `data/reviews.json` : Avis de séjours vérifiés et notes écologiques.
  - **Zéro dépendance externe obligatoire** : Latence quasi nulle (< 5 ms), immunité totale aux erreurs réseau, blocages de politiques RLS ou quotas de services tiers.
  - **Double synchronisation transparente** : Persistance disque serveur + synchronisation `localStorage` navigateur + réhydratation automatique au chargement (`refreshUsers`, `refreshBookings`).
- **Gestion Découplée & Haute Résolution des Profils Utilisateurs** :
  - **Isolation stricte par utilisateur** : Correction de la mutation d'état pour cibler exclusivement l'identifiant unique `currentUser.id`. La personnalisation d'un profil voyageur n'écrase plus les autres comptes du même rôle.
  - **Support des photos d'avatar jusqu'à 15 Mo** : Prise en charge des téléversements en glisser-déposer (Drag & Drop), sélection de fichiers locaux (JPG, PNG, WEBP) ou URL web, avec payload Express étendu à 15 Mo.
  - **Modal de profil enrichie (`UserProfileModal.tsx`)** :
    - Prévisualisation instantanée de la photo avec zone interactive Drag & Drop.
    - Bouton contextuel intelligent : rétablit la photo officielle de Ba Tamsir pour Ba Tamsir, ou la photo par défaut pour les autres profils.
    - Indicateur d'état dynamique pendant l'enregistrement avec notification contextuelle.
  - **Nouvelle API REST Utilisateurs (`/api/users`)** :
    - `GET /api/users` : Récupération de l'annuaire des utilisateurs enregistrés.
    - `GET /api/users/:id` : Consultation d'une fiche utilisateur détaillée.
    - `PUT /api/users/:id` : Mise à jour atomique du profil et de la photo avec persistance immédiate dans `data/users.json`.
    - `POST /api/users` : Enregistrement de nouveaux comptes lors de l'inscription.
- **Harmonisation du Panneau d'Interconnexion (`SupabaseConnectionPanel.tsx`)** :
  - Affichage clair et dynamique du statut **« Option 1 : Base Serveur Active »** avec badge vert confirmant la persistance locale lorsque Supabase n'est pas utilisé.
  - Fourniture du schéma SQL PostgreSQL corrigé (`supabase/schema.sql`) avec table `public.users` acceptant les identifiants textuels et politiques RLS sans blocage.

### [v1.9.0] — 20 Septembre 2026 : Liste Déroulante Dynamique des Communes Rurales par Région
- **Sélection Dynamique Région ➔ Commune Rurale dans le Menu « Déposer une annonce rurale »** :
  - **Menu Déposer une annonce (`HostDashboard.tsx`)** :
    - Lorsque l'hôte sélectionne une **Région rurale** (Occitanie, Bourgogne-Franche-Comté, Provence-Alpes-Côte d'Azur, Nouvelle-Aquitaine, Auvergne-Rhône-Alpes, Bretagne, Normandie, Grand Est), la liste des **Communes rurales** s'adapte instantanément sous forme de **liste déroulante synchronisée** (`<select>`).
    - Base de données des communes rurales (`src/data/ruralLocations.ts`) intégrant les villages authentiques, le département associé, le code postal, les coordonnées géographiques précises et une note de terroir (ex. *Gorges du Tarn & falaises calcaires*, *Maison du Parc du Morvan*, *Vallon de l'Aiguebrun*, *Vallée des Aldudes*).
    - Sélection automatique du département et des coordonnées GPS dès le choix du village.
    - Fiche récapitulative dynamique affichant les détails du terroir et le code postal sous le sélecteur.
    - Option de repli **« Autre commune rurale (saisie manuelle)... »** permettant aux hôtes de saisir librement un hameau ou village hors liste avec son département.
    - Validation proactive à l'étape 1 avant de passer à l'étape suivante.
  - **Console Administrateur CMS (`AdminCMSPanel.tsx`)** :
    - Intégration du même sélecteur synchronisé Région ➔ Commune rurale dans le formulaire d'ajout et d'édition des hébergements.

- **Intégration de l'Avatar Officiel de Ba Tamsir** :
  - Photographie haute définition de **Ba Tamsir** (costume sombre, pull col V noir, chemise blanche, cravate marron et écharpe en laine marron) intégrée comme avatar de référence (`/public/ba_tamsir_avatar.jpg` et `/src/assets/images/ba_tamsir_avatar_1789921539405.jpg`).
  - Remplacement de l'avatar dans la barre de navigation (`Navbar.tsx`), le menu déroulant profil utilisateur, la gestion d'état session (`AppContext.tsx`) et l'historique des avis (`mockData.ts`).
  - Prise en charge sécurisée avec attribut `referrerPolicy="no-referrer"` pour garantir la fluidité d'affichage sans restriction cross-origin.
- **Manuel d'Utilisation Intégral & Interactif dans le README** :
  - Restructuration et rédaction exhaustive du **Manuel d'Utilisation** couvrant les trois grands rôles (Voyageur, Hôte Rural, Administrateur CMS).
  - Guides pas-à-pas illustrés pour la recherche de séjour, la carte GPS interactive, la simulation de réservation Stripe, le suivi de séjour avec code d'accès, la messagerie interne, la modération d'annonces et l'exportation CSV Supabase.
  - Section FAQ et aide au dépannage pour les nouveaux utilisateurs.

### [v1.7.0] — 19 Septembre 2026 : Export CSV des Réservations depuis la Table 'bookings' Supabase
- **Bouton d'Exportation CSV dans le Tableau de Bord Administrateur** :
  - Intégration d'un bouton **« Exporter Réservations CSV (Supabase) »** visible en haut du back-office administrateur (`AdminDashboard.tsx`).
  - Intégration directe dans le CMS au niveau de la section **« Réservations »** (`AdminCMSPanel.tsx`) pour exporter instantanément les réservations affichées.
  - Intégration également dans le panneau d'interconnexion Supabase (`SupabaseConnectionPanel.tsx`).
- **Extraction & Traitement des Données de la Table Supabase** :
  - Module dédié `src/utils/exportBookingsCsv.ts` extrayant les colonnes conformes au schéma de la table `public.bookings` (ID, dates, nuits, montants financiers, hôte, voyageur, code d'accès, CO2 économisé, statuts).
  - Génération de fichier CSV avec encodage **UTF-8 avec BOM (`\uFEFF`)** pour ouverture native sans corruption d'accents sous Microsoft Excel, LibreOffice et Google Sheets.
  - Endpoint serveur dédié `GET /api/bookings/export-csv` dans `server/routes/bookings.ts` permettant également l'exportation côté API backend connecté à Supabase.

### [v1.6.0] — 19 Septembre 2026 : Authentification Voyageur/Hôte & Console CMS Administrateur (CRUD Global)
- **Système d'Authentification Complet & Sécurisation des Espaces** :
  - **Boutons « Connexion » et « Inscription »** intégrés dans la barre de navigation supérieure (`Navbar.tsx`).
  - **Formulaire d'authentification (`AuthModal.tsx`)** avec 3 modes intégrés :
    - *Connexion* : Saisie de l'identifiant (email) et du mot de passe avec validation des identifiants et alertes contextuelles.
    - *Inscription* : Choix du profil (« Voyageur curieux » ou « Hôte rural »), nom, email, téléphone et mot de passe sécurisé.
    - *Mot de passe oublié* : Procédure de réinitialisation en 2 étapes (envoi de lien de réinitialisation simulé et génération d'un nouveau mot de passe).
  - **Protection stricte des espaces** :
    - Accès à **« Mes Réservations & Voyages »** (`my_trips`), **« Espace Hôte »** (`host_space`) et **« Console Admin »** (`admin_space`) verrouillé si non authentifié.
    - Affichage d'un sas d'accueil informatif invitant l'utilisateur à se connecter ou s'inscrire pour déverrouiller son espace.
  - **Menu Profil Connecté** :
    - Avatar, badge de rôle (Voyageur, Hôte, Admin), bouton d'accès rapide à ses données et bouton de **Déconnexion** instantané.
    - Persistance locale de la session utilisateur via `localStorage`.

- **Console CMS Plateforme pour l'Administrateur (`AdminCMSPanel.tsx`)** :
  - Intégration d'un onglet **« CMS Plateforme (CRUD Global) »** directement dans le tableau de bord administrateur (`AdminDashboard.tsx`).
  - **Opérations CRUD Complètes (Create, Read, Update, Delete)** :
    - *Gîtes & Annonces* : Création d'hébergement, modification des tarifs, capacité, photos, statuts (`publiee`, `en_attente`, `a_modifier`, `rejetee`), suppression avec modale de confirmation.
    - *Utilisateurs & Rôles* : Ajout de comptes, modification des rôles (`voyageur`, `hote`, `admin`), vérification des hôtes ruraux, réinitialisation de mots de passe, suppression de comptes.
    - *Réservations* : Création manuelle de réservations, mise à jour des dates, voyageurs, montants totaux, passage en confirmée/annulée/terminée.
    - *Paramètres Plateforme* : Édition en direct de l'accroche d'accueil (Hero Tagline), du sous-titre, du taux de commission solidaire (%) et de la taxe de séjour.

### [v1.5.0] — 18 Septembre 2026 : Identité Officielle & Maintenance README Continue
- **Ajout du Logo Officiel My Stay Voyager** :
  - Intégration de l'emblème circulaire officiel avec ses massifs, forêts de pins, flots d'eau vive et mention `VOYAGER - MSV -`.
  - Création du composant React `src/components/LogoMyStayVoyager.tsx` gérant 4 variantes (`horizontal`, `badge`, `footer`, `full`).
  - Intégration dans la barre de navigation (`Navbar.tsx`), le Hero Banner (`App.tsx`) et le pied de page (`Footer`).
  - Mise à jour du Favicon du site (`index.html`) avec l'emblème officiel.
- **Maintenance Documentaire Systématique** :
  - Renseignement complet du `README.md` avec description visuelle, guide d'interconnexion Supabase et protocole de suivi.

### [v1.4.0] — 18 Septembre 2026 : Découplage Supabase & Diagnostic en Direct
- **Architecture étanche 3 tiers** :
  - Séparation stricte : Client Frontend (requêtes autorisées via RLS) / Serveur Express `/api/*` (sécurisation des clés secrètes) / PostgreSQL Cloud Supabase.
  - Gestion gracieuse des erreurs de clés API (`Invalid API key`, timeout ou table manquante) sans aucun blocage de l'interface utilisateur.
  - Outil de test interactif avec possibilité de renseigner l'URL et la clé API en direct depuis l'application.

### [v1.3.0] — 18 Septembre 2026 : Console SQL & Bouton d'Action Dédié
- **Onglet Dédié "Stack & Supabase"** :
  - Ajout d'un bouton direct dans la barre de navigation supérieure et dans l'espace Admin.
  - Générateur du script SQL DDL officiel (`public.listings`, `public.bookings`, `public.reviews`) avec bouton de copie en 1 clic.
  - Injection de 3 réservations de test avec vérification immédiate du flux de lecture/écriture.

### [v1.2.0] — 18 Septembre 2026 : Inspecteur No-Code & Stripe Connect
- **Modélisation No-Code Complète** :
  - Schématisation de la base Airtable `MyStay_Production_v1` avec 4 tables reliées.
  - Visualisation des scénarios Make.com (Webhooks d'alerte, validation d'annonce, confirmation voyageur).
  - Décomposition transparente des paiements Stripe Connect : encaissement brut, commission solidaire MyStay (12%), virement net hôte (88%).

### [v1.1.0] — 18 Septembre 2026 : Cartographie Interactive & GPS
- **Carte OpenStreetMap & Leaflet** :
  - Visualisation géographique des hébergements labellisés.
  - Bouton de géolocalisation GPS « Autour de moi » avec recalcul dynamique de la distance en kilomètres.
  - Masquage de l'adresse exacte avant réservation (périmètre de 3 km) et déblocage post-confirmation.

### [v1.0.0] — 18 Septembre 2026 : Lancement Initial
- **Socle fonctionnel MyStay** :
  - Marketplace d'hébergements ruraux éco-responsables.
  - Gestion des 3 profils utilisateurs (Voyageur, Hôte, Administrateur).
  - Charte éco-tourisme, attribution des labels officiels et système d'avis vérifiés.

---

## 🌿 À Propos de MyStay

MyStay connecte des voyageurs en quête de ressourcement avec des hôtes engagés dans les campagnes françaises (Cévennes, Morvan, Luberon, Pays Basque, etc.).

### Les Piliers Éthiques MyStay :
- **Audit rigoureux** : Chaque hébergement doit respecter un minimum de 3 pratiques éco-responsables vérifiées (énergie renouvelable, zéro déchet, produits du terroir, etc.).
- **Protection de la tranquillité rurale** : L'adresse exacte et l'itinéraire d'accès ne sont divulgués qu'après confirmation de la réservation.
- **Transparence tarifaire** : Commission équitable de 12% réinvestie dans le soutien au monde rural, ventilation détaillée et calcul de l'empreinte carbone évitée par nuitée.

---

## 📖 Manuel d'Utilisation : Guide Complet & Pas-à-Pas

Bienvenue dans le **Manuel d'Utilisation Officiel de MyStay Voyager (MSV)**. Ce guide exhaustif vous accompagne dans chaque étape, que vous naviguiez en tant que **Voyageur** (avec le profil par défaut de **Ba Tamsir**), en tant qu'**Hôte rural** ou en tant qu'**Administrateur de la plateforme**.

---

### 1. Profil & Avatar de Ba Tamsir (Mode Démo)

La plateforme intègre par défaut le profil voyageur de **Ba Tamsir**, ambassadeur du tourisme rural et éco-responsable :

<p align="center">
  <img src="/ba_tamsir_avatar.jpg" alt="Avatar Officiel de Ba Tamsir" width="130" style="border-radius: 50%; border: 3px solid #243E36; box-shadow: 0 4px 15px rgba(0,0,0,0.12);" />
</p>

- **Identité de Référence** :
  - **Nom** : Ba Tamsir
  - **Rôle par défaut** : Voyageur éco-curieux
  - **Email** : `ba.tamsir@example.fr`
  - **Avatar officiel** : Portrait photographique haute résolution, en costume sombre, pull noir à col en V, chemise blanche, cravate et écharpe marron (`/ba_tamsir_avatar.jpg`).
  - **Bio** : *« Passionné de randonnée pédestre et de séjours nature dans les terroirs ruraux. »*
- **Sélecteur Rapide DÉMO dans la Barre Supérieure** :
  - Dans la barre de navigation, le composant `DÉMO : [✓ Voyageur] [Hôte rural] [Admin CMS]` vous permet de basculer instantanément de casquette sans devoir ressaisir d'identifiants :
    - **Voyageur** : Vous incarnez **Ba Tamsir**, visualisez ses réservations dans les Cévennes et le Morvan, et profitez de son profil complet.
    - **Hôte rural** : Vous incarnez **Antoine & Mathilde Vabre** (gérants du *Moulin des Cévennes*), accédez aux réservations reçues, au calendrier et aux revenus nets.
    - **Admin CMS** : Vous incarnez l'administrateur avec accès à la console CRUD complète, à la modération et à l'exportation CSV.

#### Gestion & Personnalisation des Profils et Avatars (Isolés & Persistants)
Vous pouvez à tout moment visualiser, modifier ou restaurer la photo de profil de l'utilisateur connecté (Ba Tamsir, Antoine ou tout nouveau compte créé) directement depuis l'interface :
1. **Accès au Modal Profil** :
   - Cliquez sur l'avatar ou le menu déroulant en haut à droite, puis sur **« Mon Profil & Changer ma photo »**.
   - Ou depuis l'espace **« Mes Voyages »**, cliquez sur le bouton **« Modifier la photo & Profil »** situé sur la bannière de profil.
2. **Changer la photo (Haute Définition jusqu'à 15 Mo)** :
   - *Glisser-déposer (Drag & Drop)* : Faites simplement glisser une image depuis votre explorateur de fichiers directement dans la zone d'avatar.
   - *Téléversement local classique* : Cliquez sur **« Importer une photo »** pour sélectionner un fichier JPG, PNG ou WEBP depuis votre appareil.
   - *URL web* : Saisissez l'adresse URL directe d'une image web hébergée.
3. **Bouton Intelligent de Rétablissement** :
   - Pour **Ba Tamsir** : Cliquez sur **« Photo officielle Ba Tamsir »** pour rétablir instantanément le portrait officiel.
   - Pour les autres profils : Cliquez sur **« Photo par défaut »** pour rétablir l'avatar d'origine associé à leur rôle (Hôte rural ou Voyageur).
4. **Sauvegarde & Persistance Totale (Option 1)** :
   - Cliquez sur **« Enregistrer les modifications »** :
     - Les données sont immédiatement synchronisées dans le state React et dans le `localStorage`.
     - L'API REST `PUT /api/users/:id` écrit les données de manière atomique dans le fichier serveur `data/users.json`.
     - L'isolation stricte par ID garantit qu'aucun autre compte utilisateur n'est altéré.
     - L'avatar persiste même après actualisation de la page, changement de navigateur ou redémarrage du serveur.

---

### 2. Authentification & Sécurisation des Espaces

Afin de protéger la vie privée des utilisateurs et les données de réservation, les espaces personnels sont strictement cloisonnés.

#### A. Connexion
1. Cliquez sur le bouton **« Se connecter »** en haut à droite de la barre de navigation.
2. Saisissez votre adresse email et votre mot de passe (ou utilisez les liens de démo en 1 clic).
3. Cliquez sur **« Se connecter »** : vous êtes immédiatement redirigé vers votre espace personnel ou la page en cours de consultation.

#### B. Inscription
1. Cliquez sur le bouton **« Inscription »**.
2. Choisissez votre statut :
   - 🎒 **Voyageur éco-curieux** : Pour explorer, mettre des séjours en favoris, réserver et échanger avec les hôtes.
   - 🏡 **Hôte rural** : Pour inscrire votre propriété, soumettre votre dossier éco-responsable et accueillir des voyageurs.
3. Renseignez votre nom complet, email, numéro de téléphone et mot de passe sécurisé.
4. Validez : votre compte est créé immédiatement et stocké avec persistance locale sécurisée.

#### C. Récupération de Mot de Passe Oublié
1. Dans la fenêtre de connexion, cliquez sur le lien **« Mot de passe oublié ? »**.
2. Saisissez votre email et validez l'envoi des instructions.
3. Un code de réinitialisation sécurisé à 6 chiffres vous est attribué avec accusé de réception électronique.
4. Saisissez votre nouveau mot de passe et validez pour rétablir immédiatement l'accès à votre compte.

#### D. Menu Profil & Déconnexion
- Cliquez sur votre avatar (en haut à droite) pour ouvrir le menu contextuel :
  - Visualisation de votre nom, email et badge de rôle.
  - Lien direct vers votre espace (**Mes Voyages**, **Espace Hôte** ou **Console Admin**).
  - Raccourci pour réinitialiser votre mot de passe.
  - Bouton rouge **« Déconnexion »** pour quitter votre session en toute sécurité.

---

### 3. Manuel Utilisateur Voyageur

Ce guide détaille le parcours complet d'un voyageur souhaitant réserver un séjour ressourçant au cœur de la campagne.

```
[Explorer] ➔ [Rechercher & Filtrer] ➔ [Carte GPS] ➔ [Fiche Gîte] ➔ [Réserver Stripe] ➔ [Mes Voyages] ➔ [Code d'accès & Avis]
```

#### Étape 1 : Rechercher et Découvrir un Séjour
- **Barre de Recherche Multi-critères** :
  - **Mots-clés / Destination** : Tapez le nom d'un massif (ex. *Cévennes*, *Morvan*, *Luberon*), d'une ville ou d'une commune rurale.
  - **Région** : Filtrez par région française (*Occitanie*, *Bourgogne-Franche-Comté*, *Provence-Alpes-Côte d'Azur*, *Nouvelle-Aquitaine*, etc.).
  - **Dates** : Sélectionnez vos dates d'arrivée et de départ souhaitées.
  - **Voyageurs** : Indiquez le nombre d'adultes et d'enfants.
- **Filtres de Typologie d'Habitat** :
  - Filtrez par type de gîte : *Éco-cabane dans les arbres*, *Moulin réhabilité*, *Gîte traditionnel en pierre*, *Bergerie cévenole*, *Chambre d'hôtes paysanne*.
- **Labels Écologiques MyStay** :
  - 🍃 **Éco-responsable** : Énergie 100% renouvelable, gestion de l'eau, zéro déchet.
  - 🏡 **Authentique** : Bâti patrimonial préservé, matériaux biosourcés.
  - 🤝 **Accueil engagé** : Partage du potager, ateliers d'apiculture ou artisanat.
  - 🌲 **Terroir prioritaire** : Soutien direct aux zones rurales éloignées.

#### Étape 2 : Utiliser la Carte Interactive & le GPS « Autour de moi »
- Cliquez sur le bouton **« Carte interactive »** en haut à droite des résultats pour basculer de l'affichage grille vers la vue géographique OpenStreetMap / Leaflet.
- **Bouton « Autour de moi » (Icône Viseur GPS)** :
  - Activez la géolocalisation pour centrer la carte sur votre position exacte.
  - Les hébergements se réordonnent automatiquement avec affichage de la distance en kilomètres (ex. *« à 24 km de vous »*).
- **Marqueurs de Carte** :
  - Cliquez sur un marqueur pour afficher un aperçu rapide du gîte (photo, prix par nuitée, note moyenne et lien vers la fiche complète).

#### Étape 3 : Explorer la Fiche Détaillée d'un Hébergement
- **Galerie Photographique & Visite Vidéo Immersion Terroir** :
  - Parcourez les photos grand format de la propriété et de son environnement naturel.
  - **Onglet « 🎬 Visite vidéo »** : Si l'hôte a renseigné un lien vidéo (YouTube, Vimeo ou MP4), plongez directement dans une visite guidée immersive du lieu en plein écran.
- **Éco-score Carbone Évité** : Visualisez l'impact écologique positif de votre séjour (ex: *-18.5 kg CO₂ / nuit* par rapport à un hôtel standard).
- **Engagements Éco-responsables Certifiés** : Liste vérifiée des pratiques (panneaux solaires, phytoépuration, compost, vélos électriques, etc.).
- **Conseils du Terroir de l'Hôte** : Recommandations personnelles de l'hôte (marché paysan du samedi, sentier pédestre secret le long de la rivière, producteur de fromage de chèvre).
- **Contacter l'Hôte en Direct (Messagerie Instantanée)** :
  - Boutons **« Contacter l'hôte »** (dans l'en-tête hôte) et **« Poser une question à l'hôte (Direct) »** (sous le bouton de réservation) pour échanger avant même d'avoir réservé.
- **Confidentialité Géographique de 3 km** : Avant la réservation, un cercle de discrétion de 3 km protège la tranquillité des propriétaires. L'adresse exacte et l'itinéraire sont débloqués dès confirmation du paiement.

#### Étape 4 : Réserver et Simuler le Paiement Sécurisé
1. Depuis la colonne latérale de droite, sélectionnez vos dates de séjour.
2. La décomposition tarifaire transparente s'affiche en temps réel :
   - Montant des nuitées (prix de base × nombre de nuits).
   - Forfait ménage écologique avec produits biodégradables.
   - Taxe de séjour reversée aux communes rurales.
   - Frais de service et commission solidaire MyStay (12%).
   - Montant total TTC.
3. Cliquez sur **« Réserver maintenant »** :
   - Saisissez les coordonnées des voyageurs.
   - Choisissez le mode de paiement (Stripe Connect sécurisé avec carte bancaire).
   - Validez pour recevoir immédiatement votre confirmation et votre accusé de réception électronique.

#### Étape 5 : Espace « Mes Voyages » & Déroulement du Séjour
- Cliquez sur **« Mes Voyages »** dans la barre de navigation :
  - **Onglet « À venir »** : Affiche vos séjours programmés.
  - **Code d'Accès Sécurisé** : Dès confirmation, votre code digicode ou l'emplacement de la boîte à clés s'affiche clairement.
  - **Adresse & Itinéraire Exacts** : Téléchargez le plan d'accès complet et lancez l'itinéraire GPS.
  - **Messagerie Instantanée Temps Réel (WebSocket)** :
    - Cliquez sur **« Messagerie instantanée »** pour ouvrir le fil de discussion en direct avec votre hôte.
    - Suivez en direct si l'hôte est connecté (« 🟢 En direct ») et observez l'animation lorsqu'il vous répond.
    - Utilisez les réponses rapides en 1 clic (*« Arrivée vers 17h30 »*, *« Demande de stationnement »*, *« Conseils randos & terroir »*).
  - **Onglet « Terminés »** : Retrouvez l'historique de vos vacances passées et vos factures.

#### Étape 6 : Dépôt d'Avis Vérifié & Évaluations Multi-critères
1. À l'issue d'un séjour terminé, cliquez sur **« Laisser un avis »**.
2. Attribuez une note globale et évaluez 4 critères éthiques :
   - *Propreté des lieux*
   - *Authenticité du cadre*
   - *Respect des engagements éco-responsables*
   - *Qualité de l'accueil de l'hôte*
3. Rédigez votre retour d'expérience et publiez votre avis : il apparaîtra publiquement sur la fiche de l'hébergement avec possibilité pour l'hôte d'y répondre avec bienveillance.

#### Étape 7 : Gestion des Coups de Cœur (Favoris)
- Cliquez sur l'icône **Cœur** en haut à droite de n'importe quelle carte de gîte pour l'ajouter à vos favoris.
- Le compteur de favoris dans la barre de navigation s'incrémente instantanément.
- Cliquez sur l'icône Cœur de la barre de navigation pour n'afficher que votre sélection personnelle de coups de cœur.

---

### 4. Manuel Utilisateur Hôte Rural

Ce guide accompagne les propriétaires, apiculteurs, agriculteurs et gérants de gîtes éco-responsables souhaitant valoriser leur patrimoine.

```
[Espace Hôte] ➔ [Déposer un Gîte] ➔ [Validation Charte (3 critères)] ➔ [Gestion Réservations] ➔ [Calendrier] ➔ [Revenus Nets 88%]
```

#### Étape 1 : Accéder à l'Espace Hôte
- Cliquez sur l'onglet **« Espace Hôte »** dans la barre de navigation (ou basculez sur le rôle démo *Hôte rural*).
- Vous arrivez sur votre tableau de bord hôte synthétisant vos hébergements actifs, vos réservations du mois et vos revenus générés.

#### Étape 2 : Déposer un Nouvel Hébergement Rural
Cliquez sur le bouton **« Déposer une annonce (< 15 min) »** (ou **« + Ajouter un gîte »**) pour ouvrir l'assistant guidé en 4 étapes conformes à la charte MyStay :
1. **Étape 1 : Informations Générales & Localisation Terroir Synchronisée** :
   - **Titre de l'annonce** (ex: *Mas cévenol en pierres sèches et source naturelle*).
   - **Typologie d'habitat** (Gîte rural traditionnel, Éco-Cabane en bois, Bergerie en pierre, Moulin réhabilité, Ferme vivrière, Yourte / Habitat léger).
   - **Capacité d'accueil** (voyageurs, chambres, salles de bain).
   - **Sélection dynamique Région rurale ➔ Commune rurale** :
     - Choisissez votre **Région rurale** (ex: *Occitanie*, *Bourgogne-Franche-Comté*, *Provence-Alpes-Côte d'Azur*, *Nouvelle-Aquitaine*, etc.).
     - La **liste déroulante de la commune rurale** s'adapte instantanément pour n'afficher que les communes et villages répertoriés dans cette région (ex: *Florac-Trois-Rivières*, *Saint-Germain-de-Calberte*, *Sainte-Énimie*, *Meyrueis*, *Le Pont-de-Montvert*...).
     - Le département, le code postal, les coordonnées GPS et les spécificités du terroir sont calculés et pré-remplis automatiquement.
     - En cas d'installation dans un petit hameau non listé, l'option **« ✍️ Autre commune rurale (saisie manuelle)... »** permet d'indiquer librement le nom de la localité et son département.
2. **Étape 2 : Charte Éco-responsable (Minimum 3 engagements obligatoires)** :
   - Sélection parmi le catalogue des pratiques éco-responsables MyStay :
     - ⚡ *Énergie 100% renouvelable & chauffe-eau solaire*
     - 💧 *Récupération d'eau de pluie & mousseurs*
     - ♻️ *Tri sélectif & compostage autonome*
     - 🧺 *Panier terroir & potager en permaculture*
     - 🚲 *Prêt de vélos & navette gare rurale*
     - 🦔 *Refuge biodiversité (LPO) & nichoirs*
3. **Étape 3 : Tarification & Mode de Réservation** :
   - Tarif par nuitée (€ TTC) et frais de ménage écologique.
   - Mode de réservation : *Instantané* (recommandé) ou *Sur demande* (délai 24h).
4. **Étape 4 : Image du Site d'Accueil, Vidéo Immersive & Conseils Terroir** :
   - **📸 Image Principale du Site d'Accueil (Où le voyageur sera accueilli)** :
     - Cadre dédié avec prévisualisation haute définition de l'environnement extérieur, du domaine ou de la bâtisse rurale.
     - Badge explicatif *« Vue du site où le voyageur sera accueilli »*.
     - Possibilité de téléverser une photo locale (PNG, JPG, WebP), de coller une URL ou de sélectionner en 1 clic un site rural de référence (Mas cévenol, Moulin d'eau, Éco-cabane, Bergerie, Ferme maraîchère, etc.).
     - Galerie de photos complémentaires pour l'intérieur (chambres, pièce de vie, sanitaires, terrasse).
   - **🎬 Vidéo de Présentation du Site & de l'Accueil Voyageur (Recommandé)** :
     - Permet au voyageur de voir le site en mouvement, les extérieurs, la quiétude de la campagne et l'ambiance où il sera accueilli.
     - Prise en charge des liens YouTube, Vimeo ou fichiers vidéo MP4/WebM directs, avec bouton d'importation de fichier vidéo local (< 25 Mo).
     - Raccourcis de test en 1 clic (*« Visite mas en pleine nature »*, *« Vue drone du domaine »*).
     - **Lecteur vidéo interactif intégré en direct dans la modale** permettant à l'hôte de lancer et vérifier la vidéo avant soumission.
   - **Description & Conseils Terroir** : Histoire du lieu, matériaux biosourcés et conseils de l'hôte.
   - Choix entre **« Sauvegarder en brouillon »** ou **« Soumettre à la modération MyStay »**.

#### Étape 3 : Gérer les Demandes de Réservation
- Dans la section **« Réservations Reçues »** :
  - Visualisez le profil du voyageur, ses dates souhaitées, le nombre de personnes et le montant net qui vous sera versé.
  - Deux boutons d'action rapide :
    - **« Confirmer la réservation »** : valide le séjour, déclenche l'encaissement et envoie automatiquement le code d'accès au voyageur.
    - **« Refuser »** : décline courtoisement la demande si le gîte est indisponible.

#### Étape 4 : Gérer le Calendrier & Bloquer des Dates
- Ouvrez l'onglet **« Calendrier des disponibilités »** :
  - Visualisez en vert les dates libres, en bleu les séjours confirmés et en gris les dates bloquées.
  - Cliquez sur une plage de dates pour les bloquer manuellement (pour travaux d'entretien, récoltes agricoles ou vacances personnelles de la famille).

#### Étape 5 : Suivi Financier & Reversements Nets
- Dans l'onglet **« Finances & Reversements »** :
  - Visualisez le modèle équitable MyStay : **88% du montant brut de chaque réservation vous est intégralement reversé**.
  - La commission solidaire de 12% prise en charge par MyStay finance l'infrastructure technique, l'assurance villégiature et les projets de reforestation partenaires.
  - Téléchargez vos relevés mensuels de versements pour votre comptabilité.

#### Étape 6 : Dialoguer avec les Voyageurs (Messagerie Instantanée Temps Réel)
- Accédez à la messagerie en direct via le bouton **« Messagerie en direct »** dans l'en-tête de l'espace hôte ou via le bouton message d'une réservation :
  - Échangez instantanément avec vos voyageurs via WebSocket sans délai de rechargement.
  - Visualisez si le voyageur est en train d'écrire en direct.
  - Utilisez les raccourcis de réponses rapides configurés pour les hôtes :
    - 🔑 *Transmission instantanée du code de la boîte à clés & heure d'accueil (dès 16h)*.
    - 📍 *Indications et consignes précises d'accès routier*.
    - 🧺 *Proposition de panier de bienvenue avec produits bio du terroir*.

---

### 5. Manuel Administrateur & Console CMS (CRUD Global)

La console d'administration centrale permet de piloter l'ensemble des données de la plateforme en temps réel, de modérer les annonces et d'exporter les réservations vers des formats exploitables.

```
[Console CMS] ➔ [CRUD Hébergements] ➔ [CRUD Utilisateurs] ➔ [CRUD Réservations & Export CSV] ➔ [Paramètres] ➔ [Audit]
```

#### Étape 1 : Accéder à la Console Administrateur
- Basculez sur le rôle **« Admin CMS »** via le sélecteur rapide de la barre de navigation, ou cliquez sur **« Administration »** dans le menu utilisateur.
- Le tableau de bord affiche les métriques clés de santé de la plateforme : total des annonces, réservations enregistrées, chiffre d'affaires global et score carbone évité cumulé.

#### Étape 2 : Console CMS — Gestion CRUD des Hébergements
Accédez à l'onglet **« CMS Plateforme »** > sous-onglet **« Gîtes & Annonces »** :
- **Create (Créer)** : Cliquez sur **« + Créer un hébergement »** pour injecter un nouveau bien directement en base de données.
- **Read (Consulter & Filtrer)** :
  - Moteur de recherche instantané par nom, ville ou identifiant technique.
  - Filtre par statut : `Publiée`, `En attente d'audit`, `À modifier`, `Rejetée`.
- **Update (Modifier)** :
  - Cliquez sur l'icône **Crayon** sur la ligne correspondante.
  - Modifiez en direct le tarif, le titre, la capacité, la région, la photo principale ou le statut de publication.
  - Validez sans rechargement de page.
- **Delete (Supprimer)** :
  - Cliquez sur l'icône **Corbeille** pour supprimer un hébergement obsolète avec modale de confirmation de sécurité.

#### Étape 3 : Console CMS — Gestion CRUD des Utilisateurs & Rôles
Accédez au sous-onglet **« Utilisateurs & Rôles »** :
- **Create** : Ajoutez manuellement un nouveau compte avec email, rôle et mot de passe provisoire.
- **Read** : Parcourez la liste de tous les inscrits avec badge de rôle (`Voyageur`, `Hôte rural`, `Administrateur`) et statut de vérification d'identité.
- **Update** :
  - Modifiez le rôle d'un compte (ex: promouvoir un voyageur au rang d'hôte ou d'administrateur).
  - Validez ou retirez le badge **« Hôte Vérifié »** après vérification de ses attestations d'assurance.
  - Réinitialisez le mot de passe d'un utilisateur en cas de blocage.
- **Delete** : Supprimez un compte avec protection interdisant la suppression accidentelle de son propre compte administrateur en cours d'utilisation.

#### Étape 4 : Console CMS — Gestion CRUD des Réservations & Exportation CSV
Accédez au sous-onglet **« Réservations »** :
- **Create** : Enregistrez une réservation téléphonique ou de régularisation manuelle.
- **Read** : Visualisez l'ensemble des réservations avec dates d'arrivée/départ, nom du voyageur, hébergement concerné, montant brut, montant net hôte et commission plateforme.
- **Update** : Modifiez le statut d'une réservation (`Confirmée`, `En attente hôte`, `Terminée`, `Annulée`).
- **Delete** : Supprimez une réservation erronée.
- **Bouton « Exporter Réservations CSV (Supabase) »** :
  - Situé en haut à droite du tableau de bord et dans la section réservations.
  - Génère instantanément un fichier CSV universel conforme au schéma relationnel PostgreSQL `public.bookings`.
  - Intègre l'en-tête technique **UTF-8 avec BOM (`\uFEFF`)** garantissant l'absence totale de caractères corrompus sous **Microsoft Excel**, **Apple Numbers**, **LibreOffice Calc** et **Google Sheets**.
  - Colonnes exportées : `id`, `listing_id`, `traveler_id`, `traveler_name`, `traveler_email`, `host_id`, `host_name`, `start_date`, `end_date`, `nights_count`, `guests_count`, `total_price`, `host_payout`, `platform_fee`, `status`, `payment_status`, `access_code`, `carbon_saved_kg`.

#### Étape 5 : Configuration Dynamique des Paramètres de la Plateforme
Accédez au sous-onglet **« Paramètres Plateforme »** :
- **Slogan Hero & Accroche** : Modifiez en direct le titre et le sous-titre de la page d'accueil sans toucher au code source.
- **Taux de Commission Plateforme (%)** : Ajustez le taux de commission solidaire (valeur par défaut : 12%).
- **Taxe de Séjour Forfaitaire (€/nuit)** : Modifiez le montant forfaitaire de taxe reversé aux territoires.
- **Bandeau d'Information / Alerte Écologique** : Rédigez un message d'information temporaire diffusé à tous les visiteurs (ex: *« Sécheresse estivale : merci de veiller à la sobriété hydrique »*).

#### Étape 6 : File de Modération & Attribution des Labels
Dans l'onglet **« Modération des Annonces »** :
- Examinez les fiches déposées par les hôtes.
- Vérifiez la conformité des justificatifs (assurance agricole, factures d'artisans biosourcés).
- Attribuez les labels officiels :
  - 🍃 *Éco-responsable*
  - 🏡 *Authentique*
  - 🤝 *Accueil engagé*
  - 🌲 *Rural prioritaire*
- Publiez l'annonce en 1 clic ou renvoyez-la à l'hôte avec une note explicative pour correction.

---

### 6. Foire Aux Questions (FAQ) & Guide de Dépannage

#### Q1 : Où puis-je voir mon avatar et mes informations personnelles ?
> Dans le coin supérieur droit de chaque page, votre avatar officiel (photo de **Ba Tamsir**) est affiché en permanence. En cliquant dessus, le menu déroulant vous présente votre nom, votre adresse email, votre badge de rôle ainsi que le bouton de déconnexion.

#### Q2 : Quand recevrai-je le digicode et l'adresse exacte de mon gîte ?
> Pour garantir la sérénité des campagnes et éviter les intrusions imprévues, l'adresse exacte et le code d'accès ne sont générés et affichés dans votre espace **« Mes Voyages »** qu'une fois la réservation confirmée par le paiement ou validée par l'hôte.

#### Q3 : Comment changer de rôle sans me déconnecter ?
> Sur ordinateur comme sur tablette, la barre supérieure propose le sélecteur **« DÉMO : [✓ Voyageur] [Hôte rural] [Admin CMS] »**. Cliquez simplement sur le bouton du rôle souhaité pour tester immédiatement l'interface correspondante.

#### Q4 : Mes données sont-elles conservées si je ferme mon navigateur ?
> Oui, absolument. Grâce à l'**Option 1 (Base Persistante Serveur)**, l'intégralité des données (photos et profils utilisateurs, réservations, annonces et avis) est automatiquement sauvegardée dans les fichiers persistants du répertoire serveur `/data/` ainsi que dans le `localStorage` du navigateur. De plus, si vous souhaitez interconnecter votre propre base relationnelle Supabase Cloud, la synchronisation miroir s'effectue automatiquement dès que vos clés sont configurées.

#### Q5 : Comment ouvrir le fichier CSV exporté sous Excel ?
> Le fichier généré par le bouton **« Exporter Réservations CSV »** utilise un encodage normalisé UTF-8 avec marqueur BOM. Double-cliquez simplement sur le fichier téléchargé : Microsoft Excel détectera immédiatement les colonnes et affichera les accents français sans distorsion.

---

## 💻 Architecture & Démarrage Développeur

### 1. Option 1 : Base Persistante Serveur Autonome (Active & Recommandée)

La plateforme intègre par défaut un moteur de persistance serveur complet, autonome et sans friction :

- **Emplacement des données** : Répertoire `/data/` situé à la racine du projet :
  - `data/users.json` : Profils complets des utilisateurs, avatars haute résolution, numéros de téléphone, bios et mots de passe.
  - `data/bookings.json` : Réservations, dates de séjour, codes d'accès sécurisés, montants financiers et économies de CO2.
  - `data/listings.json` : Annonces d'hébergements ruraux, caractéristiques, photos, labels et statuts de modération.
  - `data/reviews.json` : Avis vérifiés post-séjour et notes environnementales.
- **Avantages Clés de l'Option 1** :
  - **Prêt à l'emploi** : Fonctionne immédiatement sans création de compte tiers, sans configuration de variables d'environnement ni clé d'API.
  - **Performances maximales** : Latence quasi nulle (< 5 ms) grâce à la gestion en mémoire vive synchronisée avec écritures atomiques sur disque.
  - **Tolérance totale aux pannes externes** : Aucune indisponibilité liée à un quota externe, une restriction CORS ou une règle RLS PostgreSQL mal configurée.
  - **Double réhydratation au démarrage** : Dès l'ouverture de l'application, les fonctions `refreshUsers()` et `refreshBookings()` réinjectent les données sauvegardées dans l'application.

### 2. Structure Full-Stack Découplée

```
├── server.ts                  # Serveur Express + WebSocket (/ws/chat) + Vite Middleware (Port 3000)
├── server/                    # 🚀 BACKEND API REST & TEMPS RÉEL
│   ├── chatSocket.ts          # Moteur WebSocket natif (diffusion, saisie en direct, présence, ping/pong)
│   ├── db.ts                  # Moteur hybride : Option 1 (Disque local /data/) + Supabase
│   └── routes/                # Endpoints API (/api/users, /api/listings, /api/bookings, /api/messages, /api/health)
│
├── data/                      # 🗄️ OPTION 1 : BASE PERSISTANTE SERVEUR
│   ├── users.json             # Comptes, profils et avatars persistants
│   ├── bookings.json          # Réservations, codes d'accès et bilans carbone
│   ├── listings.json          # Hébergements éco-responsables, photos, vidéo et statuts
│   ├── reviews.json           # Avis vérifiés et notes écologiques
│   └── messages.json          # Échanges de messagerie instantanée sauvegardés
│
├── src/                       # 🎨 FRONTEND CLIENT (React 19 + Tailwind CSS)
│   ├── components/            # Composants UI, Modales, Cartes Leaflet
│   │   ├── MessagingModal.tsx # Messagerie instantanée WebSocket (volet multi-fils, frappe, présence)
│   │   ├── LogoMyStayVoyager.tsx # Composant du logo officiel MSV
│   │   ├── UserProfileModal.tsx  # Gestion et upload d'avatars haute résolution
│   │   ├── SupabaseConnectionPanel.tsx # Panneau d'interconnexion & diagnostic
│   │   └── ...
│   ├── context/AppContext.tsx # État global, persistance locale, session & hooks WebSocket
│   ├── lib/supabaseClient.ts  # Client Supabase typé avec fallback gracieux
│   └── services/              # Services de données
│       ├── apiService.ts      # Service REST pour la persistance locale et Supabase
│       └── chatSocketClient.ts # Client WebSocket résilient avec reconnexion exponentielle
│
├── public/                    # 📦 ASSETS STATIQUES
│   ├── logo.jpg               # Logo officiel My Stay Voyager
│   ├── ba_tamsir_avatar.jpg   # Portrait officiel haute résolution de Ba Tamsir
│   └── assets/logo_mystay_voyager.jpg
│
└── supabase/                  # ☁️ OPTIONNEL : BASE POSTGRESQL SUPABASE CLOUD
    ├── schema.sql             # Schéma relationnel DDL compatible ID texte et RLS
    └── seed.sql               # Données d'exemple
```

### 3. Messagerie Instantanée Temps Réel (Protocole WebSocket)

La plateforme intègre un système complet de communication instantanée reliant voyageurs et hôtes ruraux :
- **Point de terminaison WebSocket** : `ws://localhost:3000/ws/chat` (ou `wss://...` en production).
- **Format des messages** : JSON typé avec canal d'authentification (`auth`), abonnement par séjour (`join_booking`), diffusion de message (`send_message`), indicateur d'écriture en direct (`typing`), et synchronisation de présence (`presence`).
- **Résilience Réseau** :
  - Reconnexion automatique avec délai progressif (1 à 10 secondes) lors des micro-coupures réseau.
  - Détection proactive de reconnexion via `window.addEventListener('online')`.
  - Heartbeat automatique (`ping` / `pong`) toutes les 30 secondes pour prévenir les déconnexions inopinées des proxys.
- **Dualité Temps Réel & Persistance** :
  - Chaque message est diffusé instantanément via WebSocket aux interlocuteurs connectés (< 10 ms).
  - En parallèle, l'API REST `apiService.createMessage` écrit le message sur le serveur (`data/messages.json`) et dans Supabase (`public.messages`), garantissant l'accessibilité de l'historique complet lors des reconnexions futures.

### 4. Configuration Supabase (PostgreSQL Cloud Optionnel)

Si vous souhaitez doubler le stockage local avec votre propre instance Supabase Cloud :
1. Ouvrez votre projet sur [supabase.com](https://supabase.com).
2. Dans le **SQL Editor**, exécutez le script généré dans l'onglet **« Stack & Supabase »** (ou `/supabase/schema.sql`).
3. Déclarez vos variables dans `.env` :
   ```env
   # Clés côté backend
   SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

   # Clés côté frontend (publiques avec RLS)
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

### 5. Panneau de Diagnostic & Interconnexion en Direct
- Accédez à l'onglet **« Stack & Supabase »** depuis la barre de navigation.
- **Diagnostic en temps réel** : Affiche l'état du mode actif (**Option 1 : Base Serveur Active** ou **Connecté à Supabase**), le nombre d'enregistrements en base (`users`, `listings`, `bookings`, `reviews`) et le temps de réponse.
- **Formulaire de connexion direct** : Permet de renseigner et tester vos identifiants Supabase sans redémarrer le serveur.
- **Journal des requêtes** : Consultez l'historique complet des requêtes exécutées avec détails des requêtes SQL et durées en millisecondes.

### 6. Export & Synchronisation GitHub
- Dans Google AI Studio : Menu **Settings** > **Export to GitHub**.
- En local :
  ```bash
  git add .
  git commit -m "feat: Intégration logo officiel My Stay Voyager et documentation à jour"
  git push origin main
  ```

---

## 📌 Protocole de Maintenance du README

> **Règle absolue : Le fichier `README.md` doit être mis à jour à CHAQUE modification apportée au projet.**

Lors de chaque session de travail ou évolution de fonctionnalité :
1. **Ajouter une entrée dans le Journal des Modifications ([Changelog](#-journal-des-modifications-changelog-de-référence))** :
   - Indiquer la version incrémentée (ex: `v1.5.1`, `v1.6.0`).
   - Préciser la date du jour.
   - Lister les ajouts fonctionnels, modifications visuelles et correctifs techniques.
2. **Mettre à jour les sections techniques correspondantes** :
   - Nouveaux composants UI ou visuels dans la section Identité Visuelle.
   - Nouvelles tables ou endpoints dans la section Architecture.
   - Évolutions des parcours utilisateurs dans le Manuel Voyageur, Hôte ou Administrateur.

---

## 📞 Support & Contact

- **Adresse** : 14 Chemin des Faysses, 48400 Florac-Trois-Rivières (Parc National des Cévennes, France)
- **Téléphone** : +33 (0)4 66 45 01 20
- **Email** : `contact@mystay-rural.fr`
- **Marque** : My Stay Voyager — MSV
#   M y S t a y V o y e u r  
 