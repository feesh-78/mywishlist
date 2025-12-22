import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convertir l'image en base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Appeler Ollama localement
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2-vision:11b',
        prompt: `Analyze this product screenshot and extract the following information in JSON format:

{
  "title": "product name",
  "price": "price as number only (no currency symbol)",
  "currency": "EUR or USD",
  "brand": "brand name",
  "description": "short product description",
  "category": "one of: Mode, Tech, Déco, Sport, Beauté, Cuisine, Livres, Jeux, Voyage, Autre"
}

Only return the JSON, nothing else.`,
        images: [base64Image],
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error('Ollama API error');
    }

    const ollamaData = await ollamaResponse.json();
    const responseText = ollamaData.response;

    // Parser la réponse JSON
    let productData;
    try {
      // Extraire le JSON de la réponse (parfois entouré de ```json```)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        productData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing Ollama response:', responseText);
      throw new Error('Failed to parse product data');
    }

    // Valider et nettoyer les données
    const cleanedData = {
      title: productData.title || '',
      price: parseFloat(productData.price) || 0,
      currency: productData.currency || 'EUR',
      brand: productData.brand || '',
      description: productData.description || '',
      category: productData.category || 'Autre',
    };

    return NextResponse.json({
      success: true,
      data: cleanedData,
    });
  } catch (error: any) {
    console.error('Error analyzing screenshot with Ollama:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze screenshot' },
      { status: 500 }
    );
  }
}
