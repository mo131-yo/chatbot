import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index(process.env.PINECONE_NAME!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      price,
      images,
      category,
      brand,
      color,
      size,
      stock,
    } = body;

    if (!name || !description) {
      return Response.json(
        { success: false, error: "Нэр болон тайлбар заавал байх ёстой." },
        { status: 400 },
      );
    }

    const textToEmbed = `${name} ${description} ${brand} ${category} ${color} ${size} ${stock}`;

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_KEY,
    });

    const vector = await embeddings.embedQuery(textToEmbed);

    await index.upsert({
      records: [
        {
          id: Date.now().toString(),
          values: vector,
          metadata: {
            name,
            price,
            description,
            category,
            brand,
            color,
            size,
            stock,
            // image: Array.isArray(images) ? images[0] : "",
          },
        },
      ],
    });

    return Response.json({ success: true, message: "Амжилттай хадгалагдлаа" });
  } catch (error: any) {
    console.error("Бүтээгдэхүүн нэмэхэд алдаа гарлаа:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Дотоод серверт алдаа гарлаа",
      },
      { status: 500 },
    );
  }
}
