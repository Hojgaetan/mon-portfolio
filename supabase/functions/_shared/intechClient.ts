/*
  Intech API client for Supabase Edge Functions (Deno runtime)
  - Reads INTECH_BASE_URL, INTECH_API_KEY, INTECH_CALLBACK_SECRET from env
  - Provides a typed JSON fetch wrapper with base URL and default headers
  - Includes a generic webhook signature verifier (HMAC-SHA256) — adjust to Intech's spec if needed
*/

// @ts-ignore - allow Deno global in typecheck environments outside Deno
declare const Deno: any;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions<TBody = unknown> {
  path: string; // e.g., "/v1/services"
  method?: HttpMethod;
  query?: Record<string, string | number | boolean | undefined>;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
}

const BASE_URL = Deno.env.get("INTECH_BASE_URL") ?? "https://api.intech.sn";
const API_KEY = Deno.env.get("INTECH_API_KEY") ?? "";

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(path, BASE_URL.endsWith("/") ? BASE_URL : BASE_URL + "/");
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) continue;
      url.searchParams.append(k, String(v));
    }
  }
  return url.toString();
}

function defaultHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  if (API_KEY) {
    // Intech attend généralement l'API key dans l'en-tête Secretkey
    headers["Secretkey"] = API_KEY;
  }
  return headers;
}

export async function request<TResp = unknown, TBody = unknown>(
  opts: RequestOptions<TBody>
): Promise<{ data: TResp; response: Response }>
{
  const { path, method = "GET", query, body, headers, signal } = opts;
  const url = buildUrl(path.replace(/^\//, ""), query);

  const init: RequestInit = {
    method,
    headers: { ...defaultHeaders(), ...(headers ?? {}) },
    body: body !== undefined && method !== "GET" ? JSON.stringify(body) : undefined,
    signal,
  };

  const response = await fetch(url, init);

  const text = await response.text();
  const maybeJson = safeJsonParse(text);

  if (!response.ok) {
    const err = new Error(`Intech API ${method} ${url} failed: ${response.status} ${response.statusText}`) as Error & {
      status?: number; details?: unknown; body?: string;
    };
    err.status = response.status;
    err.details = maybeJson ?? undefined;
    err.body = maybeJson ? undefined : text;
    throw err;
  }

  return { data: maybeJson as TResp, response };
}

export const IntechClient = {
  request,
  get: <TResp = unknown>(path: string, query?: RequestOptions["query"]) => request<TResp>({ path, method: "GET", query }),
  post: <TResp = unknown, TBody = unknown>(path: string, body?: TBody) => request<TResp, TBody>({ path, method: "POST", body }),
  put: <TResp = unknown, TBody = unknown>(path: string, body?: TBody) => request<TResp, TBody>({ path, method: "PUT", body }),
  patch: <TResp = unknown, TBody = unknown>(path: string, body?: TBody) => request<TResp, TBody>({ path, method: "PATCH", body }),
  delete: <TResp = unknown>(path: string) => request<TResp>({ path, method: "DELETE" }),
};

function safeJsonParse<T = unknown>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch (_) {
    return null;
  }
}

export function getIntechEnv() {
  return {
    baseUrl: BASE_URL,
    apiKeyPresent: Boolean(API_KEY),
    callbackSecretPresent: Boolean(Deno.env.get("INTECH_CALLBACK_SECRET")),
  };
}

// Generic HMAC-SHA256 verification helper. Adjust header format and algorithm per Intech's webhook docs.
export async function verifyWebhookSignature(rawBody: Uint8Array | string, signature: string): Promise<boolean> {
  const secret = Deno.env.get("INTECH_CALLBACK_SECRET") ?? "";
  if (!secret || !signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const data = typeof rawBody === "string" ? encoder.encode(rawBody) : rawBody;
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, data);
  const computed = bytesToHex(new Uint8Array(signatureBuffer));

  // Allow signatures like "sha256=..." or raw hex
  const provided = signature.replace(/^sha256=/i, "").trim().toLowerCase();
  return timingSafeEqualHex(computed, provided);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
