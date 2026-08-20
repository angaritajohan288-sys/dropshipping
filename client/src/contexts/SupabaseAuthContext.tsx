import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type SupabaseAuthState = {
  user: User | null;
  loading: boolean;
  isRecovery: boolean;
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signUpWithPassword: (email: string, password: string) => Promise<string | null>;
  sendPasswordRecovery: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const SupabaseAuthContext = createContext<SupabaseAuthState | undefined>(undefined);

function isPasswordRecoveryRedirect() {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(window.location.search);
  return hashParams.get("type") === "recovery" || searchParams.get("type") === "recovery";
}

function clearPasswordRecoveryRedirect() {
  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(url.search);
  [hashParams, searchParams].forEach(params => {
    params.delete("type");
    params.delete("access_token");
    params.delete("refresh_token");
    params.delete("expires_at");
    params.delete("expires_in");
    params.delete("provider_token");
    params.delete("provider_refresh_token");
  });
  url.search = searchParams.toString();
  url.hash = hashParams.toString();
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash ? `#${url.hash}` : ""}`);
}

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    if (isPasswordRecoveryRedirect()) setIsRecovery(true);
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "PASSWORD_RECOVERY") setIsRecovery(true);
      if (event === "USER_UPDATED" || event === "SIGNED_OUT") setIsRecovery(false);
      setLoading(false);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const value = useMemo<SupabaseAuthState>(() => ({
    user,
    loading,
    isRecovery,
    async signInWithPassword(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error?.message ?? null;
    },
    async signUpWithPassword(email, password) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.href },
      });
      return error?.message ?? null;
    },
    async sendPasswordRecovery(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.href,
      });
      return error?.message ?? null;
    },
    async updatePassword(password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (!error) {
        clearPasswordRecoveryRedirect();
        setIsRecovery(false);
      }
      return error?.message ?? null;
    },
    async signOut() {
      await supabase.auth.signOut();
    },
  }), [isRecovery, loading, user]);

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (!context) throw new Error("useSupabaseAuth debe utilizarse dentro de SupabaseAuthProvider.");
  return context;
}
