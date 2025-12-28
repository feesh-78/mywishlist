'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LegalPage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      <h1 className="text-3xl font-bold mb-6">Mentions légales</h1>

      <div className="space-y-6">
        {/* Éditeur du site */}
        <Card>
          <CardHeader>
            <CardTitle>Éditeur du site</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Nom du site :</strong> MyWishList
            </p>
            <p>
              <strong>Propriétaire :</strong> MyWishList SAS
            </p>
            <p>
              <strong>Adresse :</strong> [À compléter]
            </p>
            <p>
              <strong>Email :</strong> contact@mywishlist.com
            </p>
            <p>
              <strong>Numéro SIRET :</strong> [À compléter]
            </p>
          </CardContent>
        </Card>

        {/* Hébergeur */}
        <Card>
          <CardHeader>
            <CardTitle>Hébergeur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Nom :</strong> Vercel Inc.
            </p>
            <p>
              <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA
            </p>
            <p>
              <strong>Site web :</strong>{' '}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                vercel.com
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Données personnelles */}
        <Card>
          <CardHeader>
            <CardTitle>Données personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              MyWishList s&apos;engage à protéger vos données personnelles conformément au
              Règlement Général sur la Protection des Données (RGPD).
            </p>
            <p>
              Pour plus d&apos;informations sur la collecte et le traitement de vos données,
              consultez notre{' '}
              <a
                href="/settings/privacy"
                className="text-primary hover:underline"
              >
                politique de confidentialité
              </a>
              .
            </p>
          </CardContent>
        </Card>

        {/* Propriété intellectuelle */}
        <Card>
          <CardHeader>
            <CardTitle>Propriété intellectuelle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              L&apos;ensemble du contenu de ce site (textes, images, vidéos, design, etc.) est
              la propriété exclusive de MyWishList, sauf mention contraire.
            </p>
            <p>
              Toute reproduction, distribution ou utilisation non autorisée est strictement
              interdite et peut donner lieu à des poursuites judiciaires.
            </p>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>Cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              Ce site utilise des cookies essentiels pour assurer son bon fonctionnement et
              améliorer votre expérience utilisateur.
            </p>
            <p>
              En continuant à naviguer sur ce site, vous acceptez l&apos;utilisation de cookies.
            </p>
          </CardContent>
        </Card>

        {/* Responsabilité */}
        <Card>
          <CardHeader>
            <CardTitle>Limitation de responsabilité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              MyWishList met tout en œuvre pour fournir des informations exactes et à jour.
              Cependant, nous ne pouvons garantir l&apos;exactitude, la complétude ou
              l&apos;actualité des informations présentes sur le site.
            </p>
            <p>
              MyWishList ne saurait être tenu responsable des dommages directs ou indirects
              résultant de l&apos;utilisation du site.
            </p>
          </CardContent>
        </Card>

        {/* Droit applicable */}
        <Card>
          <CardHeader>
            <CardTitle>Droit applicable</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Les présentes mentions légales sont régies par le droit français. Tout litige
              relatif à l&apos;utilisation du site sera soumis aux tribunaux compétents français.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
