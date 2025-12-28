'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: '',
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simuler l'envoi (à remplacer par une vraie API plus tard)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: 'Message envoyé ! ✅',
        description: 'Nous vous répondrons dans les plus brefs délais.',
      });
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/settings"
            className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux paramètres
          </Link>
        </div>

        <Card className="text-center">
          <CardContent className="pt-12 pb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Message envoyé !</h2>
            <p className="text-muted-foreground mb-6">
              Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/settings">Retour aux paramètres</Link>
              </Button>
              <Button onClick={() => {
                setIsSubmitted(false);
                setFormData({ subject: '', category: '', message: '', email: '' });
              }}>
                Envoyer un autre message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/settings"
          className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux paramètres
        </Link>
        <h1 className="text-3xl font-bold mb-2">Contactez-nous</h1>
        <p className="text-muted-foreground">
          Une question, une suggestion ou un problème ? Nous sommes là pour vous aider.
        </p>
      </div>

      <div className="space-y-6">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>Formulaire de contact</CardTitle>
            </div>
            <CardDescription>
              Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Votre email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">🐛 Signaler un bug</SelectItem>
                    <SelectItem value="feature">💡 Suggestion de fonctionnalité</SelectItem>
                    <SelectItem value="help">❓ Aide et support</SelectItem>
                    <SelectItem value="account">👤 Problème de compte</SelectItem>
                    <SelectItem value="other">📝 Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Sujet</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Résumé de votre demande"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Décrivez votre problème ou votre demande en détail..."
                  rows={6}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Envoi en cours...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer le message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Alternative Contact Methods */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Autres moyens de contact</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">Email direct</p>
              <a
                href="mailto:contact@mywishlist.app"
                className="text-sm text-primary hover:underline"
              >
                contact@mywishlist.app
              </a>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Temps de réponse</p>
              <p className="text-sm text-muted-foreground">
                Nous nous efforçons de répondre à tous les messages sous 24-48 heures
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Link */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Avant de nous contacter, consultez notre{' '}
              <Link href="/settings/about" className="text-primary hover:underline">
                page À propos
              </Link>{' '}
              pour en savoir plus sur l&apos;application.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
