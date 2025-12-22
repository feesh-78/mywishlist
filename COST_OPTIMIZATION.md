# 💰 Optimisation des Coûts - Analyse d'Images

## Problème actuel
L'analyse d'images avec Gemini peut coûter cher avec beaucoup d'utilisations.

## Solutions pour réduire les coûts

### 1. ✅ Analyse optionnelle (IMPLÉMENTÉ)
- L'utilisateur upload d'abord l'image
- L'analyse IA n'est lancée que s'il clique sur "Analyser avec l'IA"
- **Économie : 100% si non utilisé**

### 2. 🔄 Alternatives API moins chères

#### Option A : Claude 3 Haiku (Anthropic)
```bash
# Coût : ~$0.25 / 1M tokens (images)
# Installation
npm install @anthropic-ai/sdk
```

**Avantages :**
- Très bon rapport qualité/prix
- Excellente analyse d'images
- API simple

**Configuration :**
```env
ANTHROPIC_API_KEY=sk-ant-...
```

#### Option B : GPT-4o mini (OpenAI)
```bash
# Coût : ~$0.15 / 1M tokens vision
npm install openai
```

**Avantages :**
- Moins cher que GPT-4 Vision
- Bonne qualité d'analyse

**Configuration :**
```env
OPENAI_API_KEY=sk-...
```

#### Option C : Llama Vision (Gratuit avec Ollama)
```bash
# GRATUIT - Hébergé localement
brew install ollama
ollama pull llama3.2-vision
```

**Avantages :**
- ✅ 100% gratuit
- Pas de limite
- Privé (local)

**Inconvénients :**
- ❌ Nécessite un serveur puissant
- ❌ Plus lent

### 3. 🎯 Limiter l'usage

#### Quota utilisateur
```typescript
// Limiter à 10 analyses/jour par utilisateur
const MAX_ANALYSES_PER_DAY = 10;

// Vérifier avant d'analyser
const count = await supabase
  .from('image_analyses')
  .select('count')
  .eq('user_id', userId)
  .gte('created_at', startOfDay);

if (count >= MAX_ANALYSES_PER_DAY) {
  throw new Error('Quota journalier atteint');
}
```

#### Rate limiting
```typescript
// npm install @upstash/ratelimit @upstash/redis
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 analyses/heure
});
```

### 4. 💡 Solution hybride recommandée

**Pour production :**
1. **Analyse optionnelle** (déjà fait ✅)
2. **Utiliser Claude 3 Haiku** pour le meilleur rapport qualité/prix
3. **Limiter à 5-10 analyses/jour/user**
4. **Cache les résultats** pour URL identiques

**Pour développement :**
- Ollama + Llama Vision (gratuit, local)

### 5. 📊 Comparaison des coûts

| Service | Coût / 1000 images | Qualité | Vitesse |
|---------|-------------------|---------|---------|
| Gemini Pro Vision | ~$2.50 | ⭐⭐⭐⭐⭐ | Rapide |
| Claude 3 Haiku | ~$0.80 | ⭐⭐⭐⭐ | Rapide |
| GPT-4o mini | ~$0.60 | ⭐⭐⭐⭐ | Rapide |
| Llama Vision (Ollama) | GRATUIT | ⭐⭐⭐ | Moyen |

### 6. 🔧 Implémentation recommandée

#### Étape 1 : Installer Claude SDK
```bash
npm install @anthropic-ai/sdk
```

#### Étape 2 : Créer `/app/api/analyze-screenshot-cheap/route.ts`
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get('image') as File;

  // Convertir en base64
  const bytes = await image.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: image.type,
            data: base64,
          },
        },
        {
          type: 'text',
          text: 'Analyse ce produit et extrais: titre, prix, marque, description en JSON',
        },
      ],
    }],
  });

  return Response.json(message.content[0].text);
}
```

#### Étape 3 : Mise à jour .env
```env
ANTHROPIC_API_KEY=sk-ant-...
```

## 💰 Estimation des coûts mensuels

**Scénario 1 : 100 utilisateurs, 5 analyses/mois chacun**
- Avec Gemini : ~$1.25/mois
- Avec Claude Haiku : ~$0.40/mois
- Avec Ollama : $0 (gratuit)

**Scénario 2 : 1000 utilisateurs, 10 analyses/mois**
- Avec Gemini : ~$25/mois
- Avec Claude Haiku : ~$8/mois
- Avec Ollama : $0 (mais coût serveur)

## 🎯 Recommandation finale

Pour ton projet :
1. ✅ Garder l'analyse **optionnelle** (déjà fait)
2. 🔄 Passer à **Claude 3 Haiku** (70% moins cher que Gemini)
3. 🎯 Ajouter limite de **5-10 analyses/jour/utilisateur**
4. 💾 **Cacher** les résultats d'URL identiques
5. 📊 Surveiller l'usage avec un dashboard

**Coût estimé : < $10/mois pour 1000 utilisateurs actifs**
