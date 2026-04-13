import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64 } = req.body;

    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Analyze this fishing scene. Return JSON with clarity, cover, bankType, skySeen, confidence, tags, and summary."
            },
            {
              type: "input_image",
              image_url: imageBase64
            }
          ]
        }
      ]
    });

    const result = JSON.parse(response.output_text);

    return res.status(200).json(result);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed" });
  }
}
