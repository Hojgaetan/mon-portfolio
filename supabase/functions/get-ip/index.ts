// @ts-ignore
declare const Deno: any;

function extractIp(req: Request): string | null {
  const h = req.headers;
  const candidates = [
    h.get("x-client-ip"),
    h.get("x-real-ip"),
    h.get("cf-connecting-ip"),
    h.get("x-forwarded-for")?.split(",")[0]?.trim(),
  ].filter(Boolean) as string[];
  if (candidates.length > 0) return candidates[0];
  try {
    // @ts-ignore
    const info = (req as any)?.conn?.remoteAddr;
    if (info && typeof info?.hostname === "string") return info.hostname;
  } catch {}
  return null;
}

Deno.serve(async (req) => {
  const ip = extractIp(req);
  return new Response(JSON.stringify({ ip }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
});

