import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL manquante' },
        { status: 400 }
      );
    }

    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'URL invalide' },
        { status: 400 }
      );
    }

    // Fetch the page
    const response = await fetch(validUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MyWishList/1.0; +https://mywishlist.com)',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 seconds
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Impossible de récupérer la page' },
        { status: 400 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract Open Graph and meta tags
    const metadata = {
      title:
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').text() ||
        '',

      description:
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        '',

      image:
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        $('meta[property="og:image:url"]').attr('content') ||
        '',

      price:
        $('meta[property="product:price:amount"]').attr('content') ||
        $('meta[property="og:price:amount"]').attr('content') ||
        // Try to find price in common patterns
        $('.price').first().text().replace(/[^\d.,]/g, '') ||
        $('[class*="price"]').first().text().replace(/[^\d.,]/g, '') ||
        '',

      currency:
        $('meta[property="product:price:currency"]').attr('content') ||
        $('meta[property="og:price:currency"]').attr('content') ||
        'EUR',
    };

    // Clean up the data
    metadata.title = metadata.title.trim();
    metadata.description = metadata.description.trim().substring(0, 1000);

    // Handle relative image URLs
    if (metadata.image && !metadata.image.startsWith('http')) {
      metadata.image = new URL(metadata.image, validUrl.origin).toString();
    }

    // Parse price
    let parsedPrice: number | null = null;
    if (metadata.price) {
      const priceNum = parseFloat(metadata.price.replace(',', '.'));
      if (!isNaN(priceNum)) {
        parsedPrice = priceNum;
      }
    }

    return NextResponse.json({
      title: metadata.title,
      description: metadata.description,
      imageUrl: metadata.image,
      price: parsedPrice,
      currency: metadata.currency,
      url: validUrl.toString(),
    });

  } catch (error: any) {
    console.error('Error extracting URL:', error);

    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Délai d\'attente dépassé' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'extraction des données' },
      { status: 500 }
    );
  }
}
