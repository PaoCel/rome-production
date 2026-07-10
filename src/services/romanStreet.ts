import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db, PROJECT_ID } from '../config/firebase';

// One-click importer for the "Roman Street" scouting locations.
// Creates a single location requirement ("Roman Street") and one option per
// address that was pinned in Apple Maps. Each option keeps the readable street
// address (which becomes a "view on map" link in the app) plus the original
// Apple Maps share link so the exact pin is never lost.
//
// Idempotent: fixed document ids mean re-running overwrites instead of
// duplicating. Writes into projects/<PROJECT_ID>/{locationRequirements,locationOptions}.

const REQUIREMENT_ID = 'LOC-ROMAN-STREET';

const REQUIREMENT = {
  requirement: 'Roman Street',
  status: 'Researching',
  notes: 'Scouting locations pinned in Apple Maps (Monterotondo / Capena / Sacrofano area).',
};

type RomanStreetOption = {
  id: string;
  optionName: string;
  address: string;
  link: string; // Apple Maps share link — keeps the exact pin
  coords: string;
};

const OPTIONS: RomanStreetOption[] = [
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

// requirement + every option
export const ROMAN_STREET_DOC_COUNT = 1 + OPTIONS.length;

export async function importRomanStreetLocations(): Promise<number> {
  const batch = writeBatch(db);
  const now = serverTimestamp();

  const reqRef = doc(db, 'projects', PROJECT_ID, 'locationRequirements', REQUIREMENT_ID);
  batch.set(reqRef, { ...REQUIREMENT, source: 'roman-street', createdAt: now, updatedAt: now });

  for (const o of OPTIONS) {
    const ref = doc(db, 'projects', PROJECT_ID, 'locationOptions', o.id);
    batch.set(ref, {
      requirementId: REQUIREMENT_ID,
      optionName: o.optionName,
      address: o.address,
      link: o.link,
      status: 'To source',
      notes: `Apple Maps pin — coordinates: ${o.coords}`,
      source: 'roman-street',
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  return ROMAN_STREET_DOC_COUNT;
}

export async function clearRomanStreetLocations(): Promise<number> {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'projects', PROJECT_ID, 'locationRequirements', REQUIREMENT_ID));
  for (const o of OPTIONS) {
    batch.delete(doc(db, 'projects', PROJECT_ID, 'locationOptions', o.id));
  }
  await batch.commit();
  return ROMAN_STREET_DOC_COUNT;
}
