'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/settings"
          className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux paramètres
        </Link>
        <h1 className="text-3xl font-bold mb-2">Politique de confidentialité</h1>
        <p className="text-muted-foreground">
          Comment nous protégeons vos données personnelles
        </p>
      </div>

      <div className="space-y-6">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Notre engagement</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Chez MyWishList, nous prenons la protection de vos données personnelles très au sérieux.
              Cette politique de confidentialité explique quelles informations nous collectons,
              comment nous les utilisons et quels sont vos droits.
            </p>
            <p className="text-sm text-muted-foreground italic">
              Dernière mise à jour : Décembre 2024
            </p>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Données collectées</CardTitle>
            </div>
            <CardDescription>
              Les informations que nous recueillons pour faire fonctionner le service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Informations de compte</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li>Adresse email (pour l&apos;authentification)</li>
                <li>Nom d&apos;utilisateur et nom complet</li>
                <li>Photo de profil et biographie (optionnelles)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Contenu créé par vous</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li>Listes de souhaits et produits</li>
                <li>Commentaires et interactions sociales</li>
                <li>Photos et images uploadées</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Données d&apos;utilisation</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li>Statistiques d&apos;engagement (vues, likes, bookmarks)</li>
                <li>Préférences de navigation et catégories visitées</li>
                <li>Données techniques (type d&apos;appareil, navigateur)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Usage */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <CardTitle>Utilisation des données</CardTitle>
            </div>
            <CardDescription>
              Comment nous utilisons vos informations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">•</div>
              <p className="text-sm text-muted-foreground">
                <strong>Fournir le service</strong> : Créer et gérer votre compte, afficher vos listes de souhaits
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">•</div>
              <p className="text-sm text-muted-foreground">
                <strong>Personnalisation</strong> : Recommander du contenu pertinent basé sur vos préférences
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">•</div>
              <p className="text-sm text-muted-foreground">
                <strong>Améliorer l&apos;application</strong> : Analyser l&apos;utilisation pour optimiser les fonctionnalités
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">•</div>
              <p className="text-sm text-muted-foreground">
                <strong>Communication</strong> : Vous envoyer des notifications importantes (si activées)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Sécurité des données</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Vos données sont stockées de manière sécurisée sur des serveurs Supabase,
              une plateforme certifiée et conforme aux standards de sécurité internationaux.
            </p>
            <p>
              Nous utilisons le chiffrement HTTPS pour toutes les communications et ne stockons
              jamais vos mots de passe en clair (hachage sécurisé).
            </p>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              <CardTitle>Vos droits</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-semibold min-w-fit">Accès :</span>
                <span>Vous pouvez consulter toutes vos données depuis votre profil</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold min-w-fit">Modification :</span>
                <span>Vous pouvez modifier vos informations à tout moment dans les paramètres</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold min-w-fit">Suppression :</span>
                <span>Vous pouvez supprimer votre compte et toutes vos données depuis Gestion du compte</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold min-w-fit">Portabilité :</span>
                <span>Vous pouvez exporter vos listes de souhaits à tout moment</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Third Party */}
        <Card>
          <CardHeader>
            <CardTitle>Partage avec des tiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Nous ne vendons jamais vos données personnelles.</strong>
            </p>
            <p>
              Nous partageons uniquement vos données avec :
            </p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Supabase (hébergement sécurisé des données)</li>
              <li>Vercel (hébergement de l&apos;application web)</li>
            </ul>
            <p>
              Ces services sont soumis à leurs propres politiques de confidentialité et
              sont conformes au RGPD.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Questions ?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Pour toute question concernant cette politique de confidentialité,
              vous pouvez nous contacter via la{' '}
              <Link href="/settings/contact" className="text-primary hover:underline">
                page Contact
              </Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
