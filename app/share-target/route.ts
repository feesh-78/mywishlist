import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Récupérer les données partagées
    const title = formData.get('title') as string || '';
    const text = formData.get('text') as string || '';
    const url = formData.get('url') as string || '';

    // Extraire l'URL depuis le texte si elle n'est pas dans le champ url
    let sharedUrl = url;
    if (!sharedUrl && text) {
      // Chercher une URL dans le texte (format https://...)
      const urlMatch = text.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        sharedUrl = urlMatch[0];
      }
    }

    // Construire l'URL de redirection avec les paramètres
    const redirectUrl = new URL('/add-product', request.url);

    if (title) redirectUrl.searchParams.set('title', title);
    if (text && !sharedUrl) redirectUrl.searchParams.set('text', text);
    if (sharedUrl) redirectUrl.searchParams.set('url', sharedUrl);

    // Ajouter un flag pour indiquer que c'est un partage
    redirectUrl.searchParams.set('shared', 'true');

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Erreur share-target:', error);
    // En cas d'erreur, rediriger vers /add-product sans paramètres
    return NextResponse.redirect(new URL('/add-product', request.url));
  }
}

// Gérer aussi les requêtes GET (au cas où)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get('title') || '';
  const text = searchParams.get('text') || '';
  const url = searchParams.get('url') || '';

  const redirectUrl = new URL('/add-product', request.url);
  if (title) redirectUrl.searchParams.set('title', title);
  if (text) redirectUrl.searchParams.set('text', text);
  if (url) redirectUrl.searchParams.set('url', url);
  redirectUrl.searchParams.set('shared', 'true');

  return NextResponse.redirect(redirectUrl);
}
