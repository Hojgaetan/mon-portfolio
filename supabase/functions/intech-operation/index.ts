// Intech Operation Edge Function: proxies POST /api-services/operation
// Adds apiKey from env and forwards any extra fields (for CASHIN, BILL_PAY, WHATSAPP, etc.)
// Docs strictly from: https://doc.intech.sn/doc_intech_api.php and Postman collection

// @ts-ignore - allow Deno global in typecheck
declare const Deno: any;

const BASE_URL = Deno.env.get("INTECH_BASE_URL") || "https://api.intech.sn";
const API_KEY = Deno.env.get("INTECH_API_KEY") || "";
const DEFAULT_CALLBACK_URL = Deno.env.get("INTECH_CALLBACK_URL") || ""; // optional

function withTimeout<T>(p: Promise<T>, ms = 65000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("Request timeout")), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  if (!API_KEY) return new Response("Missing INTECH_API_KEY", { status: 500, headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    console.log("Received request body:", JSON.stringify(body, null, 2));
    
    // Ensure mandatory structure per Postman: apiKey in body; callbackUrl recommended
    const payload = {
      ...body,
      apiKey: API_KEY,
      ...(body?.callbackUrl ? {} : (DEFAULT_CALLBACK_URL ? { callbackUrl: DEFAULT_CALLBACK_URL } : {})),
    };
    
    console.log("Sending payload to Intech:", JSON.stringify(payload, null, 2));

    const resp = await withTimeout(fetch(`${BASE_URL}/api-services/operation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        // Some examples include Secretkey header even on POST; include for compatibility
        "Secretkey": API_KEY,
      },
      body: JSON.stringify(payload),
    }));

    console.log("Intech API response status:", resp.status);
    const data = await resp.json();
    console.log("Intech API response data:", JSON.stringify(data, null, 2));
    // Always forward status 201/200 as 200 to frontend
    return new Response(JSON.stringify(data), { 
      status: 200, 
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      } 
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: true, message: String(e) }), { 
      status: 500, 
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});
