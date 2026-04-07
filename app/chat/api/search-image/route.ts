import { NextResponse } from 'next/server';

const MN_TO_EN: Record<string, string> = {
  'гутал': 'shoes', 'цамц': 't-shirt', 'өмд': 'pants', 'хүрэм': 'jacket',
  'дэгээ': 'coat', 'малгай': 'hat', 'цүнх': 'bag', 'чихэвч': 'earphones',
  'утас': 'smartphone', 'компьютер': 'laptop', 'дэлгэц': 'monitor',
  'крем': 'face cream', 'шампунь': 'shampoo', 'ном': 'book', 'цаг': 'watch',
  'колонк': 'speaker', 'камер': 'camera', 'хулгана': 'mouse',
  'hoodie': 'hoodie', 'sweater': 'sweater',
};

function buildSearchQuery(query: string): string {
  let q = query.trim();
  for (const [mn, en] of Object.entries(MN_TO_EN)) {
    q = q.replace(new RegExp(mn, 'gi'), en);
  }
  const hasCyrillic = /[а-яөүёА-ЯӨҮЁ]/.test(q);
  return hasCyrillic ? `${query} product` : `${q} product white background`;
}

const BOOK_KEYWORDS = ['ном', 'book', 'тууж', 'роман', 'поттер', 'harry', 'tolkien', 'толкин'];
function isBook(q: string) {
  return BOOK_KEYWORDS.some(k => q.toLowerCase().includes(k));
}

async function tryOpenLibrary(query: string): Promise<string | null> {
  if (!isBook(query)) return null;
  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=1`,
      { next: { revalidate: 86400 } }
    );
    const data = await res.json();
    const coverId = data.docs?.[0]?.cover_i;
    if (coverId) return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
  } catch (e) { console.error('OpenLibrary error:', e); }
  return null;
}

async function tryGoogle(query: string): Promise<string | null> {
  const key = process.env.GOOGLE_API_KEY;
  const cx  = process.env.GOOGLE_CX;
  if (!key || !cx) return null;
  try {
    const res = await fetch(
      `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(buildSearchQuery(query))}&cx=${cx}&key=${key}&searchType=image&num=3&imgSize=large&imgType=photo`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    if (data.error?.code === 429 || data.error?.code === 403) {
      console.warn('⚠️ Google quota reached');
      return null;
    }
    return data.items?.[0]?.link ?? null;
  } catch (e) { console.error('Google error:', e); }
  return null;
}

async function tryPixabay(query: string): Promise<string | null> {
  const key = process.env.PIXABAY_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(buildSearchQuery(query))}&image_type=photo&per_page=5&safesearch=true&order=relevant`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return data.hits?.[0]?.webformatURL ?? null;
  } catch (e) { console.error('Pixabay error:', e); }
  return null;
}

function unsplashFallback(query: string): string {
  const keywords = buildSearchQuery(query)
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .slice(0, 2)
    .join(',') || 'product,shopping';
  return `https://source.unsplash.com/800x800/?${encodeURIComponent(keywords)}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json({ imageUrl: '/default-product.png' });

  const imageUrl =
    (await tryOpenLibrary(query)) ??
    (await tryGoogle(query))      ??
    (await tryPixabay(query))     ??
    unsplashFallback(query);

  return NextResponse.json({ imageUrl });
}