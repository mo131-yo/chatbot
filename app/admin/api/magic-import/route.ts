// import { NextResponse } from "next/server";
// import OpenAI from "openai";
// import { index } from "@/lib/api/pinecone";
// import { auth } from "@clerk/nextjs/server";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import * as XLSX from "xlsx";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

// export async function POST(req: Request) {
//   try {
//     const { userId } = await auth();
//     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const formData = await req.formData();
//     const file = formData.get("file") as File;
//     const storeName = formData.get("storeName") as string;

//     if (!file || !storeName) {
//       return NextResponse.json({ error: "Файл эсвэл дэлгүүрийн нэр алга." }, { status: 400 });
//     }

//     let rawText = "";

//     if (file.type.startsWith("image/")) {
//       const bytes = await file.arrayBuffer();
//       const base64Image = Buffer.from(bytes).toString("base64");
//       const visionRes = await openai.chat.completions.create({
//         model: "gpt-4o",
//         messages: [
//           {
//             role: "user",
//             content: [
//               { type: "text", text: "Зурган дээрх барааны нэр, үнэ, тайлбар, ангиллыг олж тогтоо." },
//               { type: "image_url", image_url: { url: `data:${file.type};base64,${base64Image}` } }
//             ],
//           },
//         ],
//       });
//       rawText = visionRes.choices[0].message.content || "";
//     } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
//       const buffer = await file.arrayBuffer();
//       const workbook = XLSX.read(buffer);
//       rawText = JSON.stringify(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]));
//     }

//     const jsonRes = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: "Текстийг JSON формат руу хөрвүүл: { name: string, price: number, description: string, category: string }" },
//         { role: "user", content: rawText }
//       ],
//       response_format: { type: "json_object" }
//     });

//     const product = JSON.parse(jsonRes.choices[0].message.content || "{}");

//     const embeddings = new OpenAIEmbeddings({
//       openAIApiKey: process.env.OPENAI_KEY,
//       modelName: "text-embedding-3-small",
//     });
//     const vector = await embeddings.embedQuery(`Бүтээгдэхүүн: ${product.name}. Тайлбар: ${product.description}`);
//     const generatedId = `prod_${Date.now()}`;

//     await index.namespace(storeName).upsert({
//       records: [{
//         id: generatedId,
//         values: vector,
//         metadata: {
//           name: product.name,
//           price: Number(product.price),
//           description: product.description || "",
//           category: product.category || "",
//           store_name: storeName,
//           product_image_url: "",
//         }
//       }]
//     });

//     return NextResponse.json({ success: true, product });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }




import { NextResponse } from "next/server";
import OpenAI from "openai";
import { index } from "@/lib/api/pinecone";
import { auth } from "@clerk/nextjs/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import * as XLSX from "xlsx";

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const storeName = formData.get("storeName") as string;

    if (!file || !storeName) {
      return NextResponse.json({ error: "Файл эсвэл дэлгүүрийн нэр олдсонгүй." }, { status: 400 });
    }

    let rawText = "";

    if (file.type.startsWith("image/")) {
      const bytes = await file.arrayBuffer();
      const base64Image = Buffer.from(bytes).toString("base64");
      const visionRes = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Зурган дээрх барааны нэр, үнэ (тоо), тайлбар, ангиллыг олж JSON болго." },
              { type: "image_url", image_url: { url: `data:${file.type};base64,${base64Image}` } }
            ],
          },
        ],
      });
      rawText = visionRes.choices[0].message.content || "";
    } else {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      rawText = JSON.stringify(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]));
    }

    const jsonRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Текстийг цэвэр JSON болго: { name: string, price: number, description: string, category: string }" },
        { role: "user", content: rawText }
      ],
      response_format: { type: "json_object" }
    });
    const product = JSON.parse(jsonRes.choices[0].message.content || "{}");

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_KEY,
      modelName: "text-embedding-3-small",
    });
    const vector = await embeddings.embedQuery(`Бараа: ${product.name}. ${product.description}`);

    await index.namespace(storeName).upsert({
      records: [{
        id: `prod_${Date.now()}`,
        values: vector,
        metadata: {
          name: product.name,
          price: Number(product.price),
          description: product.description || "",
          category: product.category || "",
          store_name: storeName,
          product_image_url: "",
        }
      }]
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}