import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index(process.env.PINECONE_NAME!);

// export async function GET() {
//   try {
//     // 1. listPaginated-аас 'vectors' талбарыг ашиглана
//     const listResult = await index.listPaginated({ limit: 100 });
//     // 1. ID-нуудыг жагсааж авах (undefined утгуудыг шүүж хасна)
//     const ids =
//       listResult.vectors?.map((v) => v.id).filter((id): id is string => !!id) ||
//       [];

//     if (ids.length === 0) {
//       return Response.json({ success: true, products: [] });
//     }

//     // 2. Fetch хийхдээ 'ids' түлхүүр үгтэй объект дотор дамжуулна
//     const fetchResult = await index.fetch({ ids: ids }); // Энд зассан

//     // 3. Үр дүнг боловсруулж буцаах
//     const products = Object.values(fetchResult.records).map((item) => ({
//       id: item.id,
//       ...item.metadata,
//     }));

//     return Response.json({ success: true, products });

//   } catch (error: any) {
//     console.error("Бараа татахад алдаа гарлаа:", error);
//     return Response.json(
//       { success: false, error: "Жагсаалтыг авч чадсангүй" },
//       { status: 500 },
//     );
//   }
// }


export async function GET() {
  try {
    
    const listResult = await index.listPaginated({ limit: 10 });
    const ids =
      listResult.vectors?.map((v) => v.id).filter((id): id is string => !!id) ||
      [];

    if (ids.length === 0) {
      return Response.json({ success: true, products: [] });
    }

    const fetchResult = await index.fetch({ ids: ids });

    const products = Object.values(fetchResult.records).map((item) => ({
      id: item.id,
      ...item.metadata,
    }));

    return Response.json({ success: true, products });
  } catch (error) {
    return Response.json(
      { success: false, error: "Алдаа гарлаа" },
      { status: 500 },
    );
  }
}
