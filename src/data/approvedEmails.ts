import { OWNER_EMAILS } from './access';

// Legacy helper: owners are always approved. Invitees are checked dynamically
// against Firestore in AuthContext.
export const APPROVED_EMAILS = OWNER_EMAILS;

export function isApproved(email: string | null | undefined): boolean {
  if (!email) return false;
  return APPROVED_EMAILS.includes(email.trim().toLowerCase());
}
