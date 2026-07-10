/**
 * One-off seed: the "Roman Street" scouting locations.
 *
 * Creates a single location requirement ("Roman Street") and one option per
 * address pinned in Apple Maps, under projects/<PROJECT_ID>/{locationRequirements,
 * locationOptions}. Mirrors the in-app importer (src/services/romanStreet.ts) —
 * same doc ids, so the two stay idempotent and interchangeable.
 *
 * Uses the Firebase Admin SDK (bypasses security rules). Auth resolves from,
 * in order: GOOGLE_APPLICATION_CREDENTIALS, ./serviceAccountKey.json, or
 * gcloud Application Default Credentials (`gcloud auth application-default login`).
 *
 * Usage (from repo root):
 *   node scripts/seedRomanStreet.mjs            # write
 *   node scripts/seedRomanStreet.mjs --dry-run  # print only
 *   node scripts/seedRomanStreet.mjs --clear     # delete the seeded docs
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import admin from 'firebase-admin';

const PROJECT_ID = 'rome-production'; // Firebase project (see .firebaserc / VITE_FIREBASE_PROJECT_ID)
const SPACE_ID = 'default-project'; // Firestore project-space (see src/config/firebase.ts)
const DRY_RUN = process.argv.includes('--dry-run');
const CLEAR = process.argv.includes('--clear');

const REQUIREMENT_ID = 'LOC-ROMAN-STREET';
const REQUIREMENT = {
  requirement: 'Roman Street',
  status: 'Researching',
  notes: 'Scouting locations pinned in Apple Maps (Monterotondo / Capena / Sacrofano area).',
  source: 'roman-street',
};

const OPTIONS = [
  {
    id: 'LOC-RS-01',
    optionName: 'Via Giovagnoli — Monterotondo',
    address: 'Via Fabio e Raffaello Giovagnoli, Monterotondo (RM), 00015',
    link: 'https://maps.apple/p/LNoMd54Tv3N-XI',
    coords: '42.051647, 12.615792',
  },
  {
    id: 'LOC-RS-02',
    optionName: 'Via Dante Alighieri — Monterotondo (1)',
    address: 'Via Dante Alighieri, Monterotondo (RM), 00015',
    link: 'https://maps.apple/p/KZ.X2AMtgHVU1k',
    coords: '42.051256, 12.613912',
  },
  {
    id: 'LOC-RS-03',
    optionName: 'Via Dante Alighieri — Monterotondo (2)',
    address: 'Via Dante Alighieri, Monterotondo (RM), 00015',
    link: 'https://maps.apple/p/kBPN9BQBYsQgxy',
    coords: '42.051494, 12.613905',
  },
  {
    id: 'LOC-RS-04',
    optionName: 'Parcheggio Nuovo Cimitero — Monterotondo',
    address: 'Parcheggio Nuovo Cimitero, Raccordo Monterotondo–Mentana, Monterotondo (RM), 00015',
    link: 'https://maps.apple/p/6TqhFBa5o6-8yK',
    coords: '42.065953, 12.632245',
  },
  {
    id: 'LOC-RS-05',
    optionName: 'Via G. Marconi — Capena',
    address: 'Via Guglielmo Marconi, Capena (RM), 00067',
    link: 'https://maps.apple/p/eV~ktZHJYqxwKZ',
    coords: '42.142014, 12.537417',
  },
  {
    id: 'LOC-RS-06',
    optionName: 'Via Castelnuovo di Porto — Sacrofano',
    address: 'Via Castelnuovo di Porto, Sacrofano (RM), 00060',
    link: 'https://maps.apple/p/ez1bNk0r1o~16s',
    coords: '42.106700, 12.449100',
  },
];

function optionDoc(o) {
  return {
    requirementId: REQUIREMENT_ID,
    optionName: o.optionName,
    address: o.address,
    link: o.link,
    status: 'To source',
    notes: `Apple Maps pin — coordinates: ${o.coords}`,
    source: 'roman-street',
  };
}

async function resolveCredential() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return admin.credential.applicationDefault();
  const local = join(process.cwd(), 'serviceAccountKey.json');
  if (existsSync(local)) {
    const key = JSON.parse(await readFile(local, 'utf8'));
    return admin.credential.cert(key);
  }
  // Falls back to gcloud Application Default Credentials.
  return admin.credential.applicationDefault();
}

async function main() {
  if (DRY_RUN) {
    console.log(`DRY RUN — would ${CLEAR ? 'delete' : 'write'} 1 requirement + ${OPTIONS.length} options`);
    console.log(`  path: projects/${SPACE_ID}/locationRequirements/${REQUIREMENT_ID}`);
    OPTIONS.forEach((o) => console.log(`  option ${o.id}: ${o.optionName} — ${o.address}`));
    return;
  }

  admin.initializeApp({ credential: await resolveCredential(), projectId: PROJECT_ID });
  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const base = db.collection('projects').doc(SPACE_ID);
  const batch = db.batch();

  if (CLEAR) {
    batch.delete(base.collection('locationRequirements').doc(REQUIREMENT_ID));
    OPTIONS.forEach((o) => batch.delete(base.collection('locationOptions').doc(o.id)));
    await batch.commit();
    console.log(`Removed Roman Street: 1 requirement + ${OPTIONS.length} options.`);
    return;
  }

  batch.set(base.collection('locationRequirements').doc(REQUIREMENT_ID), {
    ...REQUIREMENT,
    createdAt: now,
    updatedAt: now,
  });
  OPTIONS.forEach((o) =>
    batch.set(base.collection('locationOptions').doc(o.id), {
      ...optionDoc(o),
      createdAt: now,
      updatedAt: now,
    }),
  );
  await batch.commit();
  console.log(`Wrote "Roman Street" + ${OPTIONS.length} location options to projects/${SPACE_ID}.`);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
