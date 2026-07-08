import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { isApproved } from '../data/approvedEmails';

// Thrown when an authenticated user is not on the approved list.
export const NOT_APPROVED = 'not-approved';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  displayName: string;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Reject an authenticated session if the email is not approved.
async function enforceApproved(user: User | null) {
  if (user && !isApproved(user.email)) {
    await signOut(auth);
    throw new Error(NOT_APPROVED);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      // Defensive: drop any persisted session that is not approved.
      if (u && !isApproved(u.email)) {
        signOut(auth);
        setUser(null);
      } else {
        setUser(u);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      displayName: user?.displayName || user?.email?.split('@')[0] || 'User',
      login: async (email, password) => {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await enforceApproved(cred.user);
      },
      register: async (email, password) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await enforceApproved(cred.user);
      },
      loginWithGoogle: async () => {
        const cred = await signInWithPopup(auth, new GoogleAuthProvider());
        await enforceApproved(cred.user);
      },
      logout: async () => {
        await signOut(auth);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
