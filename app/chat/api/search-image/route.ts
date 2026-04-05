// import { NextResponse } from 'next/server';
// import { queryImages } from 'duckduckgo-images-api';

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const query = searchParams.get('q');

//   if (!query) {
//     return NextResponse.json({ error: "Хайлтын утга алга" }, { status: 400 });
//   }

//   try {
//     const results = await queryImages(`${query} product photo`);
    
//     if (results && results.length > 0) {
//       return NextResponse.json({ imageUrl: results[0].image });
//     }

//     return NextResponse.json({ error: "Зураг олдсонгүй" }, { status: 404 });
//   } catch (error) {
//     console.error("Search Error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const PIXABAY_KEY = "55314889-269180eb131097849a9c07ba1";

  if (!query) return NextResponse.json({ error: "No query" }, { status: 400 });

  try {
    // Pixabay-аас хайх
    const res = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3`
    );
    const data = await res.json();

    if (data.hits && data.hits.length > 0) {
      // Хамгийн эхний зургийг буцаана
      return NextResponse.json({ imageUrl: data.hits[0].webformatURL });
    }

    // Хэрэв Pixabay-аас зураг олдохгүй бол Robohash руу шилжинэ (Fallback)
    const roboImageUrl = `https://robohash.org/${encodeURIComponent(query)}?set=set4`; // set4 нь хөөрхөн муурнууд гаргадаг
    return NextResponse.json({ imageUrl: roboImageUrl });

  } catch (error) {
    // Алдаа гарсан ч гэсэн Robohash-ийг буцаавал чат эвдрэхгүй
    return NextResponse.json({ imageUrl: `https://robohash.org/${encodeURIComponent(query)}` });
  }
}