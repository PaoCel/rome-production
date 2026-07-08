# Rome Production

Simple production-management web app for a small film/video production. Track tasks,
budget, locations, casting, production options, contacts, risks and decisions — with
media uploads and comments on every item.

Built with **React + TypeScript + Vite + Tailwind + Firebase** (Auth, Firestore, Storage,
Hosting).

## Features

- 🔐 Auth: email/password + Google sign-in, protected routes
- 📊 Dashboard: KPI tiles, budget-by-category bars, selection progress, "needs attention"
- ✅ Tasks: board + list views, filters, priority colours
- 💶 Budget: per-category summary, budget stages (Estimate → Committed → Approved → Paid), est/actual/difference
- 🎬 **Two-tier planning** for Locations, Cast, Crew and Props & Wardrobe:
  each *requirement* holds several *options* — compare them, pick one, then commit it to the budget
- 📦 Production options and 📇 contacts as flat lists; ⚠️ risks & decisions
- 🖼️ Media uploads (photos / video / documents) on every option via Firebase Storage
- 💬 Comments on every entity
- 🔗 One-click "Commit to budget" from a selected option (de-duplicated by source)

### Two-tier model (requirement → options)

Locations, Cast, Crew and Props each split into a **requirement** collection (what the
production needs) and an **option** collection (candidates that could fulfil it), driven
declaratively: a requirement's `EntityConfig` points at its option config via `optionConfig`,
and the shared `LinkedOptions` component (rendered inside `EntityDetail`) lists options, picks
the winner, and commits it to the budget. Adding a new two-tier area is two `EntityConfig`
objects plus a one-line page.

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
  /tasks /budgetItems /productionOptions /contacts /risks /decisions /media /comments
  # two-tier (requirement → option) collections
  /locationRequirements /locationOptions
  /castRoles            /castingOptions
  /crewRequirements     /crewOptions
  /propItems            /propOptions
```

The MVP uses a single project id: `default-project`. Options link to their requirement via a
`requirementId` field; a requirement stores its chosen option in `selectedOptionId`.

## Seed the "Rejoice" data

`scripts/rejoice-seed-data.json` holds the real Rejoice / Story 4 data extracted from the
Excel tracker, already mapped to the new schema (with requirement→option links preserved).
Load it into Firestore once with the Admin SDK:

1. In the Firebase console: **Project settings → Service accounts → Generate new private key**.
   Save it as `serviceAccountKey.json` in the repo root (it is gitignored).
2. Run:

   ```bash
   npm install                 # pulls firebase-admin (devDependency)
   npm run seed                # writes projects/default-project/*
   # or preview without writing:
   node scripts/seed.mjs --dry-run
   ```

Documents use their Excel IDs as doc IDs (e.g. `ROLE-001`), so the seed is idempotent —
re-running overwrites instead of duplicating.

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
