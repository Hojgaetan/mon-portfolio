import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// IP utils: récupère l'IP avec cache + fallback serveur (Edge Function)
export async function getClientIP(options?: { cacheTtlMs?: number }): Promise<string | null> {
  const ttl = options?.cacheTtlMs ?? 60 * 60 * 1000; // 1h
  const key = "cached_client_ip";
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const { ip, ts } = JSON.parse(raw) as { ip: string | null; ts: number };
      if (Date.now() - ts < ttl) return ip;
    }
  } catch (e) { void e; }

  // 1) Essayer l'Edge Function (côté serveur) pour une IP fiable
  try {
    const { data, error } = await supabase.functions.invoke("get-ip", { body: {} });
    if (!error && (data as any)?.ip) {
      try { localStorage.setItem(key, JSON.stringify({ ip: (data as any).ip as string, ts: Date.now() })); } catch (e) { void e; }
      return (data as any).ip as string;
    }
  } catch (e) { void e; }

  // 2) Fallback public ip service
  try {
    const res = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
    const json = await res.json();
    if ((json as any)?.ip) {
      try { localStorage.setItem(key, JSON.stringify({ ip: (json as any).ip as string, ts: Date.now() })); } catch (e) { void e; }
      return (json as any).ip as string;
    }
  } catch (e) { void e; }

  // 3) Dernier recours
  try { localStorage.setItem(key, JSON.stringify({ ip: null, ts: Date.now() })); } catch (e) { void e; }
  return null;
}

// HTML Sanitization: Prevent XSS attacks
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false
  });
}
