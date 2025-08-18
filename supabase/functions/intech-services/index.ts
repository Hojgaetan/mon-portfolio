// Intech Services Edge Function (GET list of services)
// Based only on https://doc.intech.sn/doc_intech_api.php and the Postman collection
// Expects INTECH_API_KEY and INTECH_BASE_URL env vars

// @ts-ignore - allow Deno global in typecheck
declare const Deno: any;

const BASE_URL = Deno.env.get("INTECH_BASE_URL") || "https://api.intech.sn";
const API_KEY = Deno.env.get("INTECH_API_KEY") || "";

function withTimeout<T>(p: Promise<T>, ms = 65000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("Request timeout")), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

Deno.serve(async (req) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405 });
  }
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "Missing INTECH_API_KEY" }), { status: 500 });
  }

  try {
    const resp = await withTimeout(fetch(`${BASE_URL}/api-services/services`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        // For GET calls, the api key must be sent in Secretkey header (as in Postman collection)
        "Secretkey": API_KEY,
      },
    }));
    const data = await resp.json();
    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: true, message: String(e) }), { status: 500 });
  }
});
