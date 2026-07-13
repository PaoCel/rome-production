/**
 * Import manual casting and crew applications into the existing two-tier model.
 *
 * Default mode is a read-only dry run. Pass --commit to write. The importer:
 * - reads the live collections before planning any operation;
 * - matches exact names after case/space/accent normalization;
 * - flags one-edit spelling variants for manual review;
 * - uses deterministic document IDs and externalId checks for idempotency;
 * - never deletes data or overwrites an existing application.
 *
 * Usage:
 *   node scripts/importCastingApplications.mjs
 *   node scripts/importCastingApplications.mjs --commit
 */
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import admin from 'firebase-admin';

const SPACE_ID = 'default-project';
const COMMIT = process.argv.includes('--commit');
const SOURCE = 'email_manual_import';
const UNASSIGNED_ROLE_ID = 'ROLE-UNASSIGNED';

const casting = [
  c('CAST-001', 'Emma', 'Cetonse', 'child_actor', 'Bambina', 12, 'Roma', 'Roma', [], 'Valentina Le Rose', null, true, true, false, true, 'new', 'Candidatura inviata da Valentina Le Rose. È stato ipotizzato che possa essere la madre, ma questa informazione non è verificata.'),
  c('CAST-002', 'Valentina', 'Celentano', 'unspecified_cast', null, null, null, 'Roma', [], null, null, true, true, false, true, 'missing_information', 'Ha vissuto a Londra. Ruolo non specificato.'),
  c('CAST-003', 'Maria', null, 'child_actor', 'Bambina', 9, null, null, [], 'Elmira Bordei', null, true, false, false, true, 'missing_information', 'Compirà 10 anni a settembre. Cognome mancante. Elmira Bordei è il contatto indicato e deve essere registrata nel campo agent.'),
  c('CAST-004', 'Luigi', 'Preti', 'unspecified_cast', 'Nessun ruolo attualmente compatibile', 42, null, 'Roma', ['Inglese'], null, null, true, false, false, true, 'role_mismatch', 'Da inserire nel database ma probabilmente da scartare subito perché non esiste attualmente un ruolo compatibile.'),
  c('CAST-005', 'Dorina', 'Alimonti', 'adult_woman', 'Donna adulta', null, null, 'Roma', ['Inglese'], null, null, true, false, false, true, 'to_review', 'Ha dichiarato di essere disponibile.'),
  c('CAST-006', 'Vanessa', 'Bottero', 'adult_woman', 'Donna adulta', null, null, null, [], null, null, true, false, false, true, 'to_review', "Dalle fotografie sembra forse troppo giovane per il ruolo, ma l'età non è stata indicata."),
  c('CAST-007', 'Enrico', 'Muraro', 'grandfather_lead', 'Nonno / protagonista', null, null, 'Roma', ['Inglese'], null, null, true, false, true, true, 'to_review', "Sono presenti fotografie e link a video. Potrebbe risultare troppo giovane per il ruolo, ma l'età non è stata indicata."),
  c('CAST-008', 'Angelo', 'De Angeli', 'grandfather_lead', 'Nonno / protagonista', 64, null, null, [], null, null, false, false, false, false, 'possible_duplicate', "Potrebbe essere già presente nel database. Verificare prima dell'inserimento e non creare automaticamente un duplicato."),
  c('CAST-009', 'Laura', 'Centofanti', 'adult_woman', 'Donna, fascia scenica 40-50 anni', null, null, 'Roma', [], null, null, false, true, false, true, 'to_review', 'Data di nascita ed età non indicate.'),
  c('CAST-010', 'Fabrizio', 'Bonora', 'grandfather_lead', 'Probabile ruolo del nonno, da confermare', 67, null, null, [], null, null, false, false, false, false, 'to_review', "Il ruolo non è stato esplicitamente indicato, ma l'età è compatibile con il ruolo del nonno."),
  c('CAST-011', 'Carlo', 'Cosolo', 'grandfather_lead', 'Nonno / protagonista', null, null, null, [], 'Vanessa Ventura', 'AP Management', false, false, false, true, 'new', 'Candidato proposto da Vanessa Ventura di AP Management.'),
  c('CAST-012', 'Carlo', 'Del Giudice', 'grandfather_lead', 'Nonno / protagonista', null, null, null, [], 'Vanessa Ventura', 'AP Management', false, false, false, true, 'new', 'Candidato proposto da Vanessa Ventura di AP Management.'),
  c('CAST-013', 'Armando', 'Puccio', 'grandfather_lead', 'Nonno / protagonista', null, null, null, [], 'Vanessa Ventura', 'AP Management', false, false, false, true, 'new', 'Candidato proposto da Vanessa Ventura di AP Management.'),
  c('CAST-014', 'Adriano', 'Giambanco', 'grandfather_lead', 'Nonno / protagonista', null, null, null, [], 'Vanessa Ventura', 'AP Management', false, false, false, true, 'new', 'Candidato proposto da Vanessa Ventura di AP Management.'),
  c('CAST-015', 'Tonino', 'Tosto', 'grandfather_lead', 'Nonno / protagonista', null, null, null, [], 'Vanessa Ventura', 'AP Management', false, false, false, true, 'new', 'Candidato proposto da Vanessa Ventura di AP Management.'),
  c('CAST-016', 'Mia', 'Ventura', 'child_actor', 'Bambina', null, null, null, [], 'Vanessa Ventura', 'AP Management', false, false, false, true, 'new', "Unica bambina del gruppo presentato da AP Management. Non registrare come fatto l'ipotesi che sia figlia della referente."),
  c('CAST-017', 'Greta', 'Zamparini', 'adult_woman', 'Donna adulta', null, null, null, [], 'Vanessa Ventura', 'AP Management', false, false, false, true, 'new', 'Candidata proposta da Vanessa Ventura di AP Management.'),
  c('CAST-018', 'Paola', 'De Crescenzo', 'adult_woman', 'Donna adulta', null, null, null, [], 'Vanessa Ventura', 'AP Management', false, false, false, true, 'new', 'Candidata proposta da Vanessa Ventura di AP Management.'),
  c('CAST-019', 'Angela', 'De Gaetano', 'adult_woman', 'Donna adulta', null, null, null, [], 'Vanessa Ventura', 'AP Management', false, false, false, true, 'new', 'Candidata proposta da Vanessa Ventura di AP Management.'),
  c('CAST-020', 'Cristina', 'Colonnetti', 'adult_woman', 'Donna adulta', null, null, null, [], 'Vanessa Ventura', 'AP Management', false, false, false, true, 'new', 'Candidata proposta da Vanessa Ventura di AP Management.'),
  c('CAST-021', 'Francesca', 'Antonucci', 'adult_woman', 'Donna adulta', null, null, null, [], 'Vanessa Ventura', 'AP Management', false, false, false, true, 'new', 'Candidata proposta da Vanessa Ventura di AP Management.'),
  c('CAST-022', 'Chiara', 'Catalano', 'adult_woman', 'Donna adulta', null, null, null, [], 'Vanessa Ventura', 'AP Management', false, false, false, true, 'new', 'Candidata proposta da Vanessa Ventura di AP Management.'),
  c('CAST-023', 'Patrizia', 'Ciabatta', 'adult_woman', 'Donna adulta', null, null, null, [], 'Vanessa Ventura', 'AP Management', false, false, false, true, 'new', 'Candidata proposta da Vanessa Ventura di AP Management.'),
  c('CAST-024', 'Veronica', 'Visentin', 'adult_woman', 'Donna adulta', null, null, null, [], 'Vanessa Ventura', 'AP Management', false, false, false, true, 'new', 'Candidata proposta da Vanessa Ventura di AP Management.'),
  c('CAST-025', 'Alessia', 'Caruso', 'adult_woman', 'Donna adulta', null, null, null, [], 'Vanessa Ventura', 'AP Management', false, false, false, true, 'new', 'Candidata proposta da Vanessa Ventura di AP Management.'),
  c('CAST-026', 'Sergio', 'Casini', 'unspecified_cast', null, null, null, null, [], null, null, false, false, false, false, 'promising', 'Candidato considerato promettente. Ruolo e altri dati non specificati.'),
  c('CAST-027', 'Olivia', 'Chiaramello', 'child_actor', 'Bambina', null, null, null, [], 'Sara Chegai', null, false, false, false, true, 'new', 'Candidatura inviata dalla madre Sara Chegai, da registrare nel campo agent.'),
  c('CAST-028', 'Fabio', 'Branchini', 'unspecified_cast', null, null, null, null, [], null, null, false, false, false, false, 'missing_information', 'Non sono stati forniti altri dettagli.'),
];

const crew = [
  c('CREW-001', 'Carola', 'Ligorati', 'first_assistant_director_or_camera', 'Possibile prima assistente alla regia o reparto camera', null, null, null, [], null, null, false, true, false, true, 'to_review', 'Non è una candidatura come attrice. La posizione precisa deve essere chiarita.'),
  c('CREW-002', 'Annalise Lotte', 'Ghirardato', 'makeup_artist', 'Make-up artist', null, null, null, [], null, null, false, false, false, false, 'new', 'È stato indicato anche il nome breve Annalise Lotte.'),
];

function c(externalId, firstName, lastName, category, roleLabel, age, birthPlace, city, languages, agent, agency, hasPhotos, hasCv, hasVideoLinks, mediaPendingUpload, status, notes) {
  return { externalId, firstName, lastName, fullName: [firstName, lastName].filter(Boolean).join(' '), category, roleLabel, age, birthPlace, city, languages, agent, agency, hasPhotos, hasCv, hasVideoLinks, mediaPendingUpload, status, notes };
}

function normalize(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function levenshtein(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const saved = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return row[b.length];
}

function isCloseName(a, b) {
  const aa = normalize(a).split(' '), bb = normalize(b).split(' ');
  return aa[0] === bb[0] && levenshtein(aa.slice(1).join(' '), bb.slice(1).join(' ')) <= 1;
}

function requirementFor(item) {
  return ({ child_actor: 'ROLE-002', adult_woman: 'ROLE-003', grandfather_lead: 'ROLE-001', unspecified_cast: UNASSIGNED_ROLE_ID })[item.category];
}

function appStatus(status) {
  return ({ new: 'Longlist', to_review: 'Longlist', promising: 'Shortlisted', likely_reject: 'Not selected', possible_duplicate: 'Longlist', role_mismatch: 'Not selected', missing_information: 'Longlist' })[status];
}

function missingFields(item, kind = 'casting') {
  const relevant = kind === 'crew' ? ['lastName', 'roleLabel'] : ['lastName', 'age', 'birthPlace', 'city', 'roleLabel'];
  return relevant.filter((key) => item[key] == null);
}

function optionData(item, kind) {
  const base = {
    candidateName: item.fullName,
    requirementId: kind === 'casting' ? requirementFor(item) : item.category === 'makeup_artist' ? 'CRW-004' : 'CRW-003',
    availability: 'To check', status: appStatus(item.status), budgetStage: 'Estimate only',
    externalId: item.externalId, source: SOURCE, originalCategory: item.category,
    originalStatus: item.status, roleLabel: item.roleLabel, firstName: item.firstName,
    lastName: item.lastName, agent: item.agent, agency: item.agency,
    hasPhotos: item.hasPhotos, hasCv: item.hasCv, hasVideoLinks: item.hasVideoLinks,
    mediaPendingUpload: item.mediaPendingUpload, missingFields: missingFields(item),
    notes: item.notes,
  };
  if (kind === 'casting') {
    Object.assign(base, { age: item.age == null ? '' : String(item.age), birthPlace: item.birthPlace, city: item.city, languages: item.languages });
  } else base.role = item.roleLabel;
  if (item.agent) base.contactName = item.agent;
  return Object.fromEntries(Object.entries(base).filter(([, value]) => value !== null));
}

async function credential() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return admin.credential.applicationDefault();
  const local = join(process.cwd(), 'serviceAccountKey.json');
  if (existsSync(local)) return admin.credential.cert(JSON.parse(await readFile(local, 'utf8')));
  return admin.credential.applicationDefault();
}

async function main() {
  const rc = JSON.parse(await readFile(join(process.cwd(), '.firebaserc'), 'utf8'));
  const projectId = rc.projects?.default;
  if (!projectId) throw new Error('Missing default Firebase project in .firebaserc');
  admin.initializeApp({ credential: await credential(), projectId });
  const db = admin.firestore();
  const base = db.collection('projects').doc(SPACE_ID);
  const [castSnap, crewSnap, rolesSnap] = await Promise.all([
    base.collection('castingOptions').get(), base.collection('crewOptions').get(), base.collection('castRoles').get(),
  ]);
  const existing = {
    casting: castSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    crew: crewSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  };
  const plan = { create: [], duplicates: [], possibleDuplicates: [], updates: [], missingInformation: [] };

  for (const [kind, items] of [['casting', casting], ['crew', crew]]) {
    for (const item of items) {
      const docs = existing[kind];
      const exact = docs.find((d) => normalize(d.candidateName || '') === normalize(item.fullName) || d.externalId === item.externalId);
      if (exact) {
        plan.duplicates.push({ externalId: item.externalId, name: item.fullName, documentId: exact.id, reason: 'exact normalized name or externalId' });
        if (item.externalId === 'CAST-008') {
          const additions = Object.fromEntries(Object.entries({ externalId: item.externalId, source: SOURCE, originalCategory: item.category, originalStatus: item.status, hasPhotos: item.hasPhotos, hasCv: item.hasCv, hasVideoLinks: item.hasVideoLinks, mediaPendingUpload: item.mediaPendingUpload }).filter(([key]) => exact[key] === undefined));
          if (Object.keys(additions).length) plan.updates.push({ kind, documentId: exact.id, name: item.fullName, additions });
        }
        continue;
      }
      const close = docs.find((d) => isCloseName(d.candidateName || '', item.fullName));
      if (close) {
        plan.possibleDuplicates.push({ externalId: item.externalId, name: item.fullName, possibleMatch: close.candidateName, documentId: close.id, reason: 'one-character surname difference' });
        continue;
      }
      const documentId = `${SOURCE.replaceAll('_', '-')}-${item.externalId.toLowerCase()}`;
      plan.create.push({ kind, documentId, name: item.fullName, data: optionData(item, kind) });
      const missing = missingFields(item, kind);
      if (missing.length) plan.missingInformation.push({ externalId: item.externalId, name: item.fullName, fields: missing });
    }
  }

  const needsUnassignedRole = plan.create.some((x) => x.kind === 'casting' && x.data.requirementId === UNASSIGNED_ROLE_ID);
  const roleExists = rolesSnap.docs.some((d) => d.id === UNASSIGNED_ROLE_ID);
  printReport(plan, projectId, needsUnassignedRole && !roleExists);
  if (!COMMIT) return;

  const now = admin.firestore.FieldValue.serverTimestamp();
  const batch = db.batch();
  if (needsUnassignedRole && !roleExists) batch.create(base.collection('castRoles').doc(UNASSIGNED_ROLE_ID), {
    role: 'Unassigned casting applications', type: 'Unassigned', qty: 0, ageRange: '', gender: 'Any',
    status: 'Researching', notes: 'Candidature casting ricevute senza un ruolo compatibile o specificato.', source: SOURCE,
    createdAt: now, updatedAt: now,
  });
  for (const entry of plan.create) {
    const collection = entry.kind === 'casting' ? 'castingOptions' : 'crewOptions';
    batch.create(base.collection(collection).doc(entry.documentId), { ...entry.data, createdAt: now, updatedAt: now });
  }
  for (const update of plan.updates) {
    const collection = update.kind === 'casting' ? 'castingOptions' : 'crewOptions';
    batch.update(base.collection(collection).doc(update.documentId), { ...update.additions, updatedAt: now });
  }
  await batch.commit();
  console.log(`\nCOMMIT COMPLETATO: ${plan.create.length} candidature create, ${plan.updates.length} record esistenti integrati.`);
}

function printReport(plan, projectId, createsRole) {
  console.log(`${COMMIT ? 'PIANO DI IMPORTAZIONE' : 'DRY RUN — nessuna scrittura'} | Firebase ${projectId} | projects/${SPACE_ID}`);
  console.log(`Candidature da creare: ${plan.create.length} (casting ${plan.create.filter((x) => x.kind === 'casting').length}, crew ${plan.create.filter((x) => x.kind === 'crew').length})`);
  console.log(`Duplicati esatti non creati: ${plan.duplicates.length}`);
  console.log(`Possibili duplicati non creati: ${plan.possibleDuplicates.length}`);
  console.log(`Record esistenti da integrare senza sovrascrittura: ${plan.updates.length}`);
  console.log(`Nuovo requisito non assegnato: ${createsRole ? UNASSIGNED_ROLE_ID : 'no'}`);
  console.log('\nCREAZIONI');
  for (const x of plan.create) console.log(`  ${x.data.externalId} -> ${x.kind === 'casting' ? 'castingOptions' : 'crewOptions'}/${x.documentId} | ${x.name} | ${x.data.requirementId} | ${x.data.status}`);
  console.log('\nDUPLICATI ESATTI');
  for (const x of plan.duplicates) console.log(`  ${x.externalId} ${x.name} -> ${x.documentId}`);
  console.log('\nPOSSIBILI DUPLICATI');
  for (const x of plan.possibleDuplicates) console.log(`  ${x.externalId} ${x.name} ~ ${x.possibleMatch} -> ${x.documentId}`);
  console.log('\nINFORMAZIONI MANCANTI (solo record da creare)');
  for (const x of plan.missingInformation) console.log(`  ${x.externalId} ${x.name}: ${x.fields.join(', ')}`);
  console.log('\nINTEGRAZIONI NON DISTRUTTIVE');
  for (const x of plan.updates) console.log(`  ${x.name} -> ${x.documentId}: ${Object.keys(x.additions).join(', ')}`);
}

main().catch((error) => {
  console.error(`\nImport fallito: ${error.message}`);
  process.exitCode = 1;
});
