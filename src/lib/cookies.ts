// Utilitaires simples pour gérer les cookies (client-side)
export type SameSite = "lax" | "strict" | "none";

export function setCookie(
  name: string,
  value: string,
  options: {
    days?: number;
    maxAgeSeconds?: number;
    path?: string;
    secure?: boolean;
    sameSite?: SameSite;
  } = {}
) {
  if (typeof document === "undefined") return;
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.maxAgeSeconds) {
    cookie += `; Max-Age=${options.maxAgeSeconds}`;
  } else if (options.days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + options.days * 24 * 60 * 60 * 1000);
    cookie += `; Expires=${expires.toUTCString()}`;
  }
  cookie += `; Path=${options.path ?? "/"}`;
  if (options.secure ?? (typeof window !== "undefined" && window.location.protocol === "https:")) {
    cookie += "; Secure";
  }
  cookie += `; SameSite=${options.sameSite ?? "lax"}`;

  document.cookie = cookie;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${encodeURIComponent(name)}=`))
    ?.split("=")[1];
  return value ? decodeURIComponent(value) : null;
}

export function deleteCookie(name: string, path: string = "/") {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=${path}`;
}

// Consentement RGPD
export type CookieConsent = {
  necessary: boolean; // toujours vrai
  preferences: boolean;
  analytics: boolean;
};

const CONSENT_COOKIE = "cookie_consent";

export function getConsent(): CookieConsent | null {
  try {
    const raw = getCookie(CONSENT_COOKIE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed) {
      return {
        necessary: true,
        preferences: !!parsed.preferences,
        analytics: !!parsed.analytics,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function setConsent(consent: CookieConsent) {
  const toStore = JSON.stringify({
    preferences: !!consent.preferences,
    analytics: !!consent.analytics,
  });
  // Consent: 180 jours
  setCookie(CONSENT_COOKIE, toStore, { days: 180, sameSite: "lax" });
}

export function hasAnalyticsConsent(): boolean {
  const c = getConsent();
  return !!c?.analytics;
}

export function hasPreferencesConsent(): boolean {
  const c = getConsent();
  return !!c?.preferences;
}

