import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type SupabaseAuthState = {
  user: User | null;
  loading: boolean;
  sendMagicLink: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const SupabaseAuthContext = createContext<SupabaseAuthState | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const value = useMemo<SupabaseAuthState>(() => ({
    user,
    loading,
    async sendMagicLink(email) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.href },
      });
      return error?.message ?? null;
    },
    async signOut() {
      await supabase.auth.signOut();
    },
  }), [loading, user]);

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (!context) throw new Error("useSupabaseAuth debe utilizarse dentro de SupabaseAuthProvider.");
  return context;
}
