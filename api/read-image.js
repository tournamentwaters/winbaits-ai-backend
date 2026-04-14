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

    if (!body || !body.imageBase64) {
      return jsonResponse({ error: "Missing imageBase64" }, 400);
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
Look at this image and return ONLY valid JSON.

{
  "summary": "short plain English description",
  "image_type": "fishing lure | water scene | fish | boat | person | object | unknown",
  "objects": ["item 1", "item 2", "item 3"],
  "confidence": "85%"
}
              `.trim(),
            },
            {
              type: "input_image",
              image_url: body.imageBase64,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_object",
        },
      },
      max_output_tokens: 250,
    });

    const text = response.output_text || "{}";
    const data = JSON.parse(text);

    return jsonResponse({
      summary: data.summary || "Image analyzed",
      image_type: data.image_type || "unknown",
      objects: Array.isArray(data.objects) ? data.objects : [],
      confidence: data.confidence || "60%",
    });
  } catch (err) {
    return jsonResponse({
      error: "Backend failed",
      details: err.message || "Unknown error",
    }, 500);
  }
}
