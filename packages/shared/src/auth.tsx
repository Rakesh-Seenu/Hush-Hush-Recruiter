import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createApiClient, type ApiClient, type AuthHeaderProvider } from "./api";
import { firebaseConfigured, getFirebaseAuth } from "./firebase";
import type { Me } from "./types";

type AuthMode = "demo" | "firebase";

const AUTH_MODE: AuthMode =
  ((import.meta as any).env?.VITE_AUTH_MODE as AuthMode) ||
  (firebaseConfigured() ? "firebase" : "demo");

const DEMO_KEY = "hush_demo_email";
const DEMO_TOKEN_KEY = "hush_demo_token";

interface AuthContextValue {
  mode: AuthMode;
  user: Me | null;
  loading: boolean;
  error: string | null;
  api: ApiClient;
  login: (email: string, password: string) => Promise<Me>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Holds the raw credential used to build auth headers: an email (demo) or
  // nothing (firebase reads the current user directly).
  const demoEmailRef = useRef<string | null>(
    typeof localStorage !== "undefined" ? localStorage.getItem(DEMO_KEY) : null,
  );
  // In demo mode the password doubles as an optional admin token (X-Demo-Token),
  // checked by the backend only when DEMO_ADMIN_TOKEN is configured there.
  const demoTokenRef = useRef<string | null>(
    typeof localStorage !== "undefined" ? localStorage.getItem(DEMO_TOKEN_KEY) : null,
  );

  const getAuthHeaders: AuthHeaderProvider = useCallback(async () => {
    const headers: Record<string, string> = {};
    if (AUTH_MODE === "firebase") {
      const current = getFirebaseAuth().currentUser;
      if (current) headers.Authorization = `Bearer ${await current.getIdToken()}`;
      return headers;
    }
    if (demoEmailRef.current) headers["X-Demo-Email"] = demoEmailRef.current;
    if (demoTokenRef.current) headers["X-Demo-Token"] = demoTokenRef.current;
    return headers;
  }, []);

  const api = useMemo(() => createApiClient(getAuthHeaders), [getAuthHeaders]);

  const resolveMe = useCallback(async (): Promise<Me> => {
    // The backend is the source of truth for the role.
    return api.me();
  }, [api]);

  // Restore an existing session on load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (AUTH_MODE === "firebase") {
          const auth = getFirebaseAuth();
          const { onAuthStateChanged } = await import("firebase/auth");
          onAuthStateChanged(auth, async (fbUser) => {
            if (cancelled) return;
            if (fbUser) {
              try {
                setUser(await resolveMe());
              } catch {
                setUser(null);
              }
            } else {
              setUser(null);
            }
            setLoading(false);
          });
        } else if (demoEmailRef.current) {
          setUser(await resolveMe());
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolveMe]);

  const login = useCallback(
    async (email: string, password: string): Promise<Me> => {
      setError(null);
      if (AUTH_MODE === "firebase") {
        const auth = getFirebaseAuth();
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        demoEmailRef.current = email.trim().toLowerCase();
        demoTokenRef.current = password;
        localStorage.setItem(DEMO_KEY, demoEmailRef.current);
        localStorage.setItem(DEMO_TOKEN_KEY, password);
      }
      const me = await resolveMe();
      setUser(me);
      return me;
    },
    [resolveMe],
  );

  const register = useCallback(async (email: string, password: string) => {
    setError(null);
    if (AUTH_MODE === "firebase") {
      const auth = getFirebaseAuth();
      const { createUserWithEmailAndPassword, sendEmailVerification } = await import(
        "firebase/auth"
      );
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);
    } else {
      // demo: registration is the same as logging in.
      demoEmailRef.current = email.trim().toLowerCase();
      demoTokenRef.current = password;
      localStorage.setItem(DEMO_KEY, demoEmailRef.current);
      localStorage.setItem(DEMO_TOKEN_KEY, password);
    }
  }, []);

  const logout = useCallback(async () => {
    if (AUTH_MODE === "firebase") {
      const auth = getFirebaseAuth();
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
    }
    demoEmailRef.current = null;
    demoTokenRef.current = null;
    localStorage.removeItem(DEMO_KEY);
    localStorage.removeItem(DEMO_TOKEN_KEY);
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    mode: AUTH_MODE,
    user,
    loading,
    error,
    api,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
