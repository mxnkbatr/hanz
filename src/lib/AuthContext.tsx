import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  adminChecked: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

function envAdminEmails() {
  return (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    let ready = false;

    const applySession = (next: Session | null) => {
      if (!alive) return;
      setSession((prev) => {
        const sameUser = (prev?.user?.id ?? null) === (next?.user?.id ?? null);
        const sameToken = (prev?.access_token ?? "") === (next?.access_token ?? "");
        return sameUser && sameToken ? prev : next;
      });
      if (!ready) {
        ready = true;
        setLoading(false);
      }
    };

    // Prefer onAuthStateChange; getSession is fallback if INITIAL_SESSION is slow.
    let unsubscribe: (() => void) | undefined;
    void getSupabase().then((supabase) => {
      if (!alive) return;
      const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
        applySession(next);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
      void supabase.auth.getSession().then(({ data }) => {
        if (!alive || ready) return;
        applySession(data.session ?? null);
      });
    });
    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const email = session?.user?.email?.toLowerCase() ?? "";
    if (!email) {
      setIsAdmin(false);
      setAdminChecked(!loading);
      return;
    }

    const envHit = envAdminEmails().includes(email);
    if (envHit) {
      setIsAdmin(true);
      setAdminChecked(true);
      return;
    }

    setAdminChecked(false);
    void getSupabase().then((supabase) =>
      supabase.rpc("is_admin").then(({ data, error }) => {
        if (!alive) return;
        if (error) {
          // Fallback: allowlist table (if RPC not migrated yet)
          void supabase
            .from("admin_allowlist")
            .select("email")
            .ilike("email", email)
            .maybeSingle()
            .then((res) => {
              if (!alive) return;
              setIsAdmin(Boolean(res.data?.email));
              setAdminChecked(true);
            });
          return;
        }
        setIsAdmin(Boolean(data));
        setAdminChecked(true);
      }),
    );

    return () => {
      alive = false;
    };
  }, [session, loading]);

  const value = useMemo<AuthCtx>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      isAdmin,
      adminChecked,
      async signIn(email, password) {
        const supabase = await getSupabase();
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        return error ? { error: error.message } : {};
      },
      async signUp(email, password) {
        const supabase = await getSupabase();
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        return error ? { error: error.message } : {};
      },
      async signOut() {
        await (await getSupabase()).auth.signOut();
      },
    }),
    [session, loading, isAdmin, adminChecked],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
