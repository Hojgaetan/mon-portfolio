// Intech Services Edge Function (GET list of services)
// Based only on https://doc.intech.sn/doc_intech_api.php and the Postman collection
// Expects INTECH_API_KEY and INTECH_BASE_URL env vars

// @ts-ignore - allow Deno global in typecheck
declare const Deno: any;

import { IntechClient, getIntechEnv } from "../_shared/intechClient.ts";

Deno.serve(async (req) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405 });
  }

  const env = getIntechEnv();
  if (!env.apiKeyPresent) {
    return new Response(JSON.stringify({ error: "Missing INTECH_API_KEY" }), { status: 500 });
  }

  try {
    const { data } = await IntechClient.get<any>("api-services/services");
    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: true, message: String(e) }), { status: 500 });
  }
});
