import { NextResponse } from 'next/server';
import { queryImages } from 'duckduckgo-images-api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: "Хайлтын утга алга" }, { status: 400 });
  }

  try {
    const results = await queryImages(`${query} product photo`);
    
    if (results && results.length > 0) {
      return NextResponse.json({ imageUrl: results[0].image });
    }

    return NextResponse.json({ error: "Зураг олдсонгүй" }, { status: 404 });
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}