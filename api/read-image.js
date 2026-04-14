import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  try {
    const body = await request.json().catch(() => null);

    if (!body || !body.imageBase64) {
      return json({ error: "Missing imageBase64" }, 400);
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: 'Return ONLY JSON: {"summary":"short plain English description","image_type":"fishing lure|water scene|fish|boat|person|object|unknown","objects":["item 1","item 2"],"confidence":"85%"}'
            },
            {
              type: "input_image",
              image_url: body.imageBase64
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_object"
        }
      },
      max_output_tokens: 120
    });

    const text = response.output_text || "{}";
    const data = JSON.parse(text);

    return json({
      summary: data.summary || "Image analyzed",
      image_type: data.image_type || "unknown",
      objects: Array.isArray(data.objects) ? data.objects : [],
      confidence: data.confidence || "60%"
    });
  } catch (err) {
    return json({
      error: "Backend failed",
      details: err.message || "Unknown error"
    }, 500);
  }
}
