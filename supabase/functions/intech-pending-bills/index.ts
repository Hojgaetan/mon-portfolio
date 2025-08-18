// Intech Pending Bills Edge Function: proxies POST /api-services/list-pending-bills
// Use for *_BILL_PAY services to list unpaid bills

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
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  if (!API_KEY) return new Response("Missing INTECH_API_KEY", { status: 500 });

  try {
    const body = await req.json();
    const payload = {
      apiKey: API_KEY,
      codeService: body?.codeService,
      billAccountNumber: body?.billAccountNumber,
    };

    const resp = await withTimeout(fetch(`${BASE_URL}/api-services/list-pending-bills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Secretkey": API_KEY,
      },
      body: JSON.stringify(payload),
    }));

    const data = await resp.json();
    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: true, message: String(e) }), { status: 500 });
  }
});
