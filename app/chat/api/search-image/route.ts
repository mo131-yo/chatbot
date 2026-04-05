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

async function fetchFromDDG(query: string) {
  try {
    const res = await fetch(`https://duckduckgo.com/assets/logo.png`); 
    return `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || "";
  const PIXABAY_KEY = "55314889-269180eb131097849a9c07ba1";

  try {
    if (query.toLowerCase().includes("book") || query.toLowerCase().includes("ном")) {
      const bookRes = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=1`);
      const bookData = await bookRes.json();
      if (bookData.docs?.[0]?.cover_i) {
        return NextResponse.json({ imageUrl: `https://covers.openlibrary.org/b/id/${bookData.docs[0].cover_i}-L.jpg` });
      }
    }

    const pixabayRes = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3`
    );
    const pixabayData = await pixabayRes.json();

    if (pixabayData.hits && pixabayData.hits.length > 0) {
      return NextResponse.json({ imageUrl: pixabayData.hits[0].webformatURL });
    }

    const fallbackUrl = `https://loremflickr.com/800/600/${encodeURIComponent(query.replace(/\s+/g, ','))}`;
    return NextResponse.json({ imageUrl: fallbackUrl });

  } catch (error) {
    return NextResponse.json({ imageUrl: `https://robohash.org/${encodeURIComponent(query)}?set=set4` });
  }
}