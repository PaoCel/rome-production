# Rome Production

Simple production-management web app for a small film/video production. Track tasks,
budget, locations, casting, production options, contacts, risks and decisions — with
media uploads and comments on every item.

Built with **React + TypeScript + Vite + Tailwind + Firebase** (Auth, Firestore, Storage,
Hosting).

## Features

- 🔐 Auth: email/password + Google sign-in, protected routes
- 📊 Dashboard with live counts and budget totals
- ✅ Tasks: board + list views, filters, priority colours
- 💶 Budget: totals, category cards, editable line items
- 📍 Locations · 🎬 Casting · 📦 Production options: cards, detail panels, media galleries, comments
- 📇 Reusable contacts referenced across entities
- ⚠️ Risks & decisions
- 🖼️ Media uploads (photos / video / documents) via Firebase Storage
- 💬 Comments on every entity
- 🔗 "Add to budget" from any selected item (de-duplicated by source)

## Project structure

```
src/
  app/          Router + protected route
  components/    Reusable UI (cards, forms, media, comments, pills)
  config/        Firebase init
  contexts/      Auth provider
  data/          Owners, constants, entity schemas
  hooks/         Firestore collection hooks
  layouts/       App shell + sidebar
  pages/         One file per section
  services/      Firestore / Storage / budget CRUD
  types/         Shared types
  utils/         Money / date formatting
```

## Data model (Firestore)

```
projects/default-project
  /tasks /budgetItems /locations /castingCandidates /productionOptions
  /contacts /risks /decisions /media /comments
```

The MVP uses a single project id: `default-project`.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from the example and fill in your Firebase config:

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_MEASUREMENT_ID=...
   ```

3. In the Firebase console enable: **Authentication** (Email/Password + Google),
   **Firestore**, **Storage**.

4. Run locally:

   ```bash
   npm run dev
   ```

## Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login

# Push security rules
firebase deploy --only firestore:rules,storage

# Build and deploy the site
npm run build
firebase deploy --only hosting

# …or deploy everything at once
firebase deploy
```

The project is preconfigured in `.firebaserc` for `rome-production`.

## Security rules

MVP rules (`firestore.rules`, `storage.rules`) allow any authenticated user to
read/write project data. They are scoped per-project so per-project permissions can be
added later.
