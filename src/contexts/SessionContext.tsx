import { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { deleteCookie, setCookie } from "@/lib/cookies";

interface SessionContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const Ctx = createContext<SessionContextValue>({ session: null, user: null, loading: true });

// Timeout de session : 30 minutes d'inactivité
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Fonction pour déconnecter l'utilisateur
  const handleSessionExpiry = async () => {
    console.log("Session expirée - déconnexion automatique");
    await supabase.auth.signOut();
    setSession(null);
    writeCookies(null);
  };

  // Fonction pour réinitialiser le timer de session
  const resetSessionTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    lastActivityRef.current = Date.now();
    
    if (session) {
      timeoutRef.current = setTimeout(() => {
        handleSessionExpiry();
      }, SESSION_TIMEOUT_MS);
    }
  };

  // Écouter les événements d'activité utilisateur
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetTimer = () => {
      if (session) {
        resetSessionTimer();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [session]);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        const s = data.session ?? null;
        setSession(s);
        writeCookies(s);
        
        // Démarrer le timer de session si connecté
        if (s) {
          resetSessionTimer();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      writeCookies(newSession);
      
      // Gérer le timer selon l'état de la session
      if (newSession) {
        resetSessionTimer();
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    });

    init();
    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Nettoyer le timer au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
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

