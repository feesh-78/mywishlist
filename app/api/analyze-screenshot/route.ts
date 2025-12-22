import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialiser Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Récupérer l'image depuis le FormData
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Aucune image fournie' },
        { status: 400 }
      );
    }

    // Vérifier que c'est bien une image
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Le fichier doit être une image' },
        { status: 400 }
      );
    }

    // Convertir l'image en base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Utiliser Gemini 1.5 Pro avec vision (stable, meilleur quota)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.1, // Précision maximale
        topK: 1,
        topP: 1,
        maxOutputTokens: 500,
      },
    });

    const prompt = `Tu es un expert OCR spécialisé dans l'extraction d'informations produits depuis des screenshots mobiles (Amazon, Fnac, Instagram, etc.).

Ce screenshot provient probablement d'un TÉLÉPHONE (format vertical, interface mobile).

🔍 ÉTAPES D'ANALYSE :

1. Lis TOUT le texte visible de haut en bas
2. Identifie la zone du TITRE (généralement en haut, texte plus gros)
3. Cherche le PRIX (format: XX,XX € ou XX.XX $ - souvent en gros, parfois en gras)
4. Cherche les CARACTÉRISTIQUES techniques visibles
5. Regarde l'image du produit pour identifier la marque/type

📝 INFORMATIONS À EXTRAIRE :

**titre** : Titre COMPLET du produit
- Prends tout le texte descriptif principal
- Inclus: marque + nom + caractéristiques (ex: "UGREEN Souris Bluetooth Verticale Ergonomique sans Fil 2,4G 4000 DPI")
- NE COUPE PAS le titre, prends-le en entier

**prix** : Prix affiché
- Format Amazon FR: "29,99 €" → retourne 29.99
- Format Amazon US: "$19.99" → retourne 19.99
- Cherche dans la zone "Acheter neuf" ou près du bouton d'achat
- IMPORTANT: Enlève les espaces et convertis la virgule en point

**devise** : Monnaie
- EUR si tu vois €
- USD si tu vois $
- GBP si tu vois £

**description** : Résumé des caractéristiques techniques (max 200 caractères)
- Exemple: "Souris ergonomique verticale sans fil, 4000 DPI, compatible Mac/PC"
- Prends les specs techniques visibles

**marque** : Marque du produit
- Cherche dans le titre ou sur l'image
- Exemples: UGREEN, Apple, Samsung, Nike

**categorie** : Catégorie du produit parmi:
- Tech (électronique, informatique, souris, claviers, écouteurs)
- Mode (vêtements, chaussures, sacs)
- Déco (mobilier, décoration)
- Sport (équipement sportif)
- Beauté (cosmétiques, soins)
- Cuisine (ustensiles, appareils)
- Livres
- Jeux
- Voyage
- Autre

**url** : URL visible dans la barre d'adresse (en haut du screenshot)
- Cherche "https://" dans la zone du navigateur
- Si pas visible, mets null

⚠️ RÈGLES STRICTES :
- Ne devine JAMAIS - seulement ce qui est VISIBLE
- Prix: nombre décimal avec point (29.99 pas 29,99)
- Titre: COMPLET, ne coupe pas
- Si une info manque: null

Réponds UNIQUEMENT avec ce JSON (PAS de markdown, PAS de backticks) :

{
  "titre": "string ou null",
  "prix": 29.99,
  "devise": "EUR",
  "description": "string ou null",
  "marque": "string ou null",
  "categorie": "Tech",
  "url": "string ou null"
}`;

    // Envoyer la requête à Gemini
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Parser la réponse JSON
    let productData;
    try {
      // Nettoyer le texte (enlever les balises markdown si présentes)
      const cleanText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      productData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Erreur parsing JSON:', text);
      return NextResponse.json(
        {
          error: 'Impossible de parser la réponse de Gemini',
          rawResponse: text
        },
        { status: 500 }
      );
    }

    // Nettoyer et valider les données
    const cleanedData = {
      title: productData.titre || null,
      price: productData.prix ? parseFloat(productData.prix) : null,
      currency: productData.devise || 'EUR',
      description: productData.description || null,
      brand: productData.marque || null,
      category: productData.categorie || null,
      url: productData.url || null,
    };

    return NextResponse.json({
      success: true,
      data: cleanedData,
      raw: productData, // Pour debug
    });

  } catch (error: any) {
    console.error('Erreur API analyze-screenshot:', error);

    return NextResponse.json(
      {
        error: 'Erreur lors de l\'analyse du screenshot',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Permettre POST sans authentification pour le moment
export const runtime = 'nodejs';
