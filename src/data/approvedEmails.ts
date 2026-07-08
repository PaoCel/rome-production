// Only these emails may access the app. Add more as people are approved.
// Keep this list in sync with `isApproved()` in firestore.rules / storage.rules.
export const APPROVED_EMAILS = [
  'paolocelestini23@gmail.com',
  'spaminutili24@gmail.com',
];

export function isApproved(email: string | null | undefined): boolean {
  if (!email) return false;
  return APPROVED_EMAILS.includes(email.trim().toLowerCase());
}
