import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function toProductJSON(text: string) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini", 
    messages: [
      {
        role: "system",
        content: "Чи бол өгөгдсөн текстийг зөвхөн цэвэр JSON формат руу хөрвүүлэгч туслах юм."
      },
      {
        role: "user",
        content: `Дараах текстээс барааны мэдээллийг ялган авч JSON array болго:
        Бүтэц: [{ "name": string, "price": number, "category": string, "description": string }]

        Текст:
        ${text}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = res.choices[0].message.content || "{\"products\": []}";
  const parsed = JSON.parse(content);
  
  return Array.isArray(parsed) ? parsed : (parsed.products || []);
}

export async function imageToProducts(imageUrl: string) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Энэ зураг дээрх БҮХ барааны нэр, үнэ, ангилал, тайлбарыг тодорхой гаргаж өгнө үү." },
          { 
            type: "image_url", 
            image_url: { url: imageUrl, detail: "high" } 
          },
        ],
      },
    ],
    max_tokens: 1000,
  });

  const textResult = res.choices[0].message.content || "";

  return toProductJSON(textResult);
}