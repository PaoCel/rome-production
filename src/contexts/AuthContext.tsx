import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  doc,
  getDoc,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, db, PROJECT_ID } from '../config/firebase';
import {
  isOwnerEmail,
  NO_ACCESS_PROFILE,
  OWNER_PROFILE,
  sectionsFromInvite,
  type AccessProfile,
} from '../data/access';

// Thrown when an authenticated user is not on the approved list.
export const NOT_APPROVED = 'not-approved';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  access: AccessProfile;
  canManage: boolean;
  displayName: string;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function resolveAccess(user: User | null): Promise<AccessProfile> {
  const email = user?.email?.trim().toLowerCase();
  if (!email) return NO_ACCESS_PROFILE;
  if (isOwnerEmail(email)) return OWNER_PROFILE;

  const snap = await getDoc(doc(db, 'projects', PROJECT_ID, 'invites', email));
  const invite = snap.exists() ? snap.data() : null;
  if (!invite || invite.status !== 'active') return NO_ACCESS_PROFILE;
  return { role: 'invitee', sections: sectionsFromInvite(invite.sections) };
}

// Reject an authenticated session if the email is neither owner nor invited.
async function enforceApproved(user: User | null) {
  const access = await resolveAccess(user);
  if (user && access.role === 'none') {
    await signOut(auth);
    throw new Error(NOT_APPROVED);
  }
  return access;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessProfile>(NO_ACCESS_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        const nextAccess = await resolveAccess(u);
        if (u && nextAccess.role === 'none') {
          await signOut(auth);
          setUser(null);
          setAccess(NO_ACCESS_PROFILE);
        } else {
          setUser(u);
          setAccess(nextAccess);
        }
      } catch (err) {
        console.error('resolveAccess', err);
        if (u) {
          await signOut(auth);
          setUser(null);
          setAccess(NO_ACCESS_PROFILE);
        }
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      access,
      // Every approved user can manage the sections in their access profile.
      // SectionGuard and Firebase rules keep invitees scoped to those sections.
      canManage: access.role !== 'none',
      displayName: user?.displayName || user?.email?.split('@')[0] || 'User',
      login: async (email, password) => {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        setAccess(await enforceApproved(cred.user));
      },
      register: async (email, password) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        setAccess(await enforceApproved(cred.user));
      },
      loginWithGoogle: async () => {
        const cred = await signInWithPopup(auth, new GoogleAuthProvider());
        setAccess(await enforceApproved(cred.user));
      },
      logout: async () => {
        setAccess(NO_ACCESS_PROFILE);
        await signOut(auth);
      },
    }),
    [user, loading, access],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
