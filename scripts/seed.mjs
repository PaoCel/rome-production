/**
 * One-off seed script: loads the real "Rejoice" production data
 * (scripts/rejoice-seed-data.json, extracted from the Excel tracker) into
 * Firestore under projects/default-project/{collection}.
 *
 * Uses the Firebase Admin SDK (bypasses security rules), so you need a
 * service-account key from the Firebase console:
 *   Project settings → Service accounts → Generate new private key
 *
 * Usage (from the repo root):
 *   npm install                       # installs firebase-admin (devDependency)
 *   # option A: point at the key file
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node scripts/seed.mjs
 *   # option B: put the key at ./serviceAccountKey.json and just run
 *   node scripts/seed.mjs
 *
 * Flags:
 *   --dry-run   print what would be written, touch nothing
 *
 * Idempotent: documents use their Excel IDs as doc IDs (e.g. ROLE-001), so
 * re-running overwrites rather than duplicating. Requirement→option links are
 * preserved via the `requirementId` field.
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import admin from 'firebase-admin';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = 'default-project'; // must match src/config/firebase.ts
const DRY_RUN = process.argv.includes('--dry-run');

async function resolveCredential() {
  // GOOGLE_APPLICATION_CREDENTIALS is picked up automatically by applicationDefault().
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return admin.credential.applicationDefault();
  const local = join(process.cwd(), 'serviceAccountKey.json');
  if (existsSync(local)) {
    const key = JSON.parse(await readFile(local, 'utf8'));
    return admin.credential.cert(key);
  }
  throw new Error(
    'No credentials found. Set GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json ' +
      'or place the service-account key at ./serviceAccountKey.json',
  );
}

async function main() {
  const dataPath = join(__dirname, 'rejoice-seed-data.json');
  const data = JSON.parse(await readFile(dataPath, 'utf8'));

  if (DRY_RUN) {
    console.log('DRY RUN — nothing will be written.\n');
    for (const [col, docs] of Object.entries(data)) console.log(`  ${col}: ${docs.length} docs`);
    return;
  }

  admin.initializeApp({ credential: await resolveCredential() });
  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();

  let total = 0;
  for (const [collection, docs] of Object.entries(data)) {
    if (!docs.length) continue;
    let batch = db.batch();
    let n = 0;
    for (const doc of docs) {
      const { _id, ...fields } = doc;
      const ref = db.collection('projects').doc(PROJECT_ID).collection(collection).doc(_id);
      batch.set(ref, { ...fields, createdAt: now, updatedAt: now });
      if (++n % 400 === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }
    await batch.commit();
    total += docs.length;
    console.log(`  ✓ ${collection}: ${docs.length}`);
  }
  console.log(`\nDone — wrote ${total} documents to projects/${PROJECT_ID}.`);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
