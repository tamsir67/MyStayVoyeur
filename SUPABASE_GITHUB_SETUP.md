# Architecture MyStay : Supabase (PostgreSQL) + Backend Express + Frontend Vite

Ce projet sépare formellement le **Backend** (API REST Express + Node.js) et le **Frontend** (React 19 + Vite + Tailwind CSS), avec une persistance gérée par **Supabase**.

---

## 1. Base de données Supabase (PostgreSQL)

La base de données relationnelle est configurée avec schémas, politiques de sécurité RLS (*Row Level Security*), index spatiaux et jeu de données de test.

### Fichiers inclus :
- `/supabase/schema.sql` : Tables `profiles`, `listings`, `bookings`, `reviews`, `messages`, types ENUM, index géographiques et politiques RLS.
- `/supabase/seed.sql` : Données de démarrage prêtes à l'emploi (hébergements cévenols, profils hôtes/voyageurs, avis).

### Comment l'activer sur votre projet Supabase :
1. Rendez-vous sur votre tableau de bord [supabase.com](https://supabase.com) et créez un projet.
2. Allez dans le menu **SQL Editor**.
3. Copiez-collez et exécutez le contenu de `/supabase/schema.sql`.
4. (Optionnel) Exécutez le contenu de `/supabase/seed.sql` pour charger les données de test.
5. Dans **Project Settings > API**, copiez :
   - L'URL de votre projet (`Project URL`)
   - La clé anonyme publique (`anon` / `public`)
   - (Côté serveur uniquement) La clé `service_role` (secrète)
6. Renseignez ces variables dans votre fichier `.env` ou dans le panneau **Settings > Secrets** d'AI Studio :
   ```env
   SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

*Remarque : Tant que les clés ne sont pas renseignées, l'application fonctionne automatiquement en mode hybride résilient en mémoire pour vous permettre de tester immédiatement.*

---

## 2. Séparation Backend / Frontend

L'architecture est découpée de façon claire :

```
├── server.ts                  # Point d'entrée principal serveur (Port 3000)
├── server/                    # 🚀 BACKEND
│   ├── db.ts                  # Couche d'accès aux données (Supabase + fallback mémoire)
│   └── routes/
│       ├── listings.ts        # GET, POST, PATCH /api/listings
│       ├── bookings.ts        # GET, POST, PATCH /api/bookings
│       ├── reviews.ts         # GET, POST /api/reviews
│       └── system.ts          # GET /api/health (statut serveur & Supabase)
│
├── src/                       # 🎨 FRONTEND
│   ├── services/api.ts        # Client API communiquant avec /api/*
│   ├── lib/supabase.ts        # Client Supabase navigateur
│   ├── components/            # Composants React
│   ├── context/AppContext.tsx # État global React
│   ├── main.tsx
│   └── App.tsx
│
└── supabase/                  # 🗄️ BASE DE DONNÉES
    ├── schema.sql             # DDL PostgreSQL complet
    └── seed.sql               # Données de test
```

---

## 3. Export du code vers GitHub

Pour envoyer le code sur GitHub :

### Méthode 1 : Export en 1 clic depuis Google AI Studio (Recommandé)
1. Cliquez sur le menu **Settings** (icône d'engrenage ou menu en haut à droite).
2. Choisissez **Export to GitHub** (ou **Export to ZIP** si vous préférez un téléchargement direct).
3. Connectez votre compte GitHub et choisissez le dépôt de destination. Vos modifications y seront automatiquement poussées !

### Méthode 2 : Ligne de commande Git standard
Si vous téléchargez le dossier ZIP ou travaillez en local :
```bash
git init
git add .
git commit -m "feat: MyStay full-stack with Supabase PostgreSQL and separated backend"
git branch -M main
git remote add origin https://github.com/VOTRE_PSEUDO/mystay-rural.git
git push -u origin main
```
