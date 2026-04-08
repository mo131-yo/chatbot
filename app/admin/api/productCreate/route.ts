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
      imageUrl,
      category,
      brand,
      color,
      size,
      stock,
    } = body;

    if (!name || !description || !imageUrl) {
      return Response.json(
        { success: false, error: "Нэр, тайлбар болон зураг заавал байх ёстой." },
        { status: 400 }
      );
    }

    const textToEmbed = `Бүтээгдэхүүн: ${name}. Тайлбар: ${description}. Брэнд: ${brand || "байхгүй"}. Категори: ${category || "ерөнхий"}. Өнгө: ${color || "тодорхойгүй"}. Хэмжээ: ${size || "тодорхойгүй"}.`;
    
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_KEY,
      modelName: "text-embedding-3-small",
    });

    const vector = await embeddings.embedQuery(textToEmbed);
    const generatedId = `prod_${Date.now()}`;

  await index.upsert({
    records: [
      {
        id: generatedId,
        values: vector,
        metadata: {
  name: name, // product_name биш name болгох
  price: Number(price) || 0,
  product_image_url: imageUrl || "",
          description: description,
          category: category || "General",
          brand: brand || "Unknown",
          // product_image_url: imageUrl || "",
          stock: Number(stock) || 0,
          color: color || "",
          size: size || ""
        },
      },  
    ],
  }); 

    console.log(`✅ Success: ${name} added to Pinecone.`);

    return Response.json({ 
      success: true, 
      pineconeId: generatedId,
      message: "Бүтээгдэхүүн амжилттай бүртгэгдлээ." 
    });

  } catch (error: any) {
    console.error("Pinecone Error:", error);
    return Response.json(
      { success: false, error: error.message || "Сервер талд алдаа гарлаа" },
      { status: 500 }
    );
  }
}