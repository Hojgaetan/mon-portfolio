import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { deleteCookie, setCookie } from "@/lib/cookies";

interface SessionContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const Ctx = createContext<SessionContextValue>({ session: null, user: null, loading: true });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        const s = data.session ?? null;
        setSession(s);
        writeCookies(s);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      writeCookies(newSession);
    });

    init();
    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<SessionContextValue>(() => ({
    session,
    user: session?.user ?? null,
    loading,
  }), [session, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function writeCookies(s: Session | null) {
  // Ne stocke JAMAIS les jetons en cookies accessibles JS.
  // On place seulement des indicateurs non sensibles pour faciliter l’UI côté client.
  if (s) {
    const exp = s.expires_at ? Math.max(s.expires_at - Math.floor(Date.now() / 1000), 0) : 24 * 60 * 60;
    setCookie("sb_is_auth", "1", { maxAgeSeconds: exp, sameSite: "lax" });
    if (s.expires_at) {
      setCookie("sb_session_exp", String(s.expires_at), { maxAgeSeconds: exp, sameSite: "lax" });
    }
  } else {
    deleteCookie("sb_is_auth");
    deleteCookie("sb_session_exp");
  }
}

export function useSession() {
  return useContext(Ctx);
}

