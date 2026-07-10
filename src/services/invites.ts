import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, PROJECT_ID } from '../config/firebase';
import { updateItem } from './firestore';
import type { Section } from '../data/access';

function makeToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createInvite({
  email,
  company,
  sections,
  createdBy,
}: {
  email: string;
  company?: string;
  sections: Section[];
  createdBy?: string;
}) {
  const emailLower = email.trim().toLowerCase();
  await setDoc(doc(db, 'projects', PROJECT_ID, 'invites', emailLower), {
    email: email.trim(),
    emailLower,
    company: company?.trim() || '',
    sections,
    status: 'active',
    token: makeToken(),
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return emailLower;
}

export async function setInviteStatus(id: string, status: 'active' | 'disabled') {
  await updateItem('invites', id, { status });
}
