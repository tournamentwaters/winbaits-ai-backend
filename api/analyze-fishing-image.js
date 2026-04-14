import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return jsonResponse({ ok: true });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "POST only" }, 405);
  }

  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const { imageBase64 } = body;

    if (!imageBase64) {
      return jsonResponse({ error: "Missing imageBase64" }, 400);
    }

    if (!imageBase64.startsWith("data:image")) {
      return jsonResponse({ error: "Invalid image format" }, 400);
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Look at this fishing image and return ONLY JSON.

{
  "summary": "short description",
  "clarity": "clear | stained | muddy",
  "cover": "grass | wood | rock | docks | open",
  "bankType": "shallow | steep | flat",
  "lure_name": "name or Unknown",
  "lure_type": "spinnerbait | jig | worm | crankbait | unknown",
  "confidence": "75%"
}
              `
            },
            {
              type: "input_image",
              image_url: imageBase64
            }
          ]
        }
      ],
      text: { format: { type: "json_object" } },
      max_output_tokens: 300,
    });

    const text = response.output_text || "{}";

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return jsonResponse({
        error: "Bad AI response",
        details: text
      }, 500);
    }

    return jsonResponse({
      summary: data.summary || "Scene analyzed",
      clarity: data.clarity || "unknown",
      cover: data.cover || "unknown",
      bankType: data.bankType || "unknown",
      lure_name: data.lure_name || "Unknown",
      lure_type: data.lure_type || "unknown",
      confidence: data.confidence || "60%"
    });

  } catch (err) {
    return jsonResponse({
      error: "Backend failed",
      details: err.message
    }, 500);
  }
}
