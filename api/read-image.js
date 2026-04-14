function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export function GET() {
  return json({ error: "POST only" }, 405);
}

export function OPTIONS() {
  return json({ ok: true }, 200);
}

export async function POST(request) {
  return json({
    summary: "Instant backend test worked",
    image_type: "object",
    objects: ["backend reached", "app connected"],
    confidence: "99%"
  });
}
