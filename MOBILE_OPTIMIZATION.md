# 📱 Optimisations Mobile - MyWishList

## ✅ Optimisations implémentées

### 1. Layout global
- ✅ Grilles responsives masonry (feed)
- ✅ Grid responsive pour items (1 col mobile → 3 col desktop)
- ✅ Header adaptatif avec menu mobile
- ✅ Espacements réduits sur mobile

### 2. Touch targets (Zones tactiles)
- ✅ Boutons minimum 44x44px
- ✅ Links avec padding étendu
- ✅ Avatar cliquables agrandis sur mobile

### 3. Images
- ✅ Next/Image avec lazy loading
- ✅ Sizes responsive
- ✅ Aspect ratios préservés

### 4. Navigation
- ✅ Header sticky
- ✅ Menu mobile avec dropdown
- ✅ Icônes + labels

---

## 🎯 Recommandations d'amélioration

### Performance

#### 1. Pagination/Infinite Scroll
Actuellement, le feed charge 50 wishlists d'un coup.

**Amélioration:**
```typescript
// Au lieu de .limit(50)
.limit(20)

// Ajouter infinite scroll
const [page, setPage] = useState(1);
const loadMore = () => {
  setPage(p => p + 1);
  loadWishlists(page + 1);
};
```

#### 2. Image Optimization
Les images ne sont pas optimisées par taille d'écran.

**Amélioration:**
```tsx
<Image
  src={url}
  alt={title}
  width={400}
  height={400}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="w-full h-auto"
/>
```

#### 3. Skeleton Loaders
Au lieu d'un simple spinner, utiliser des skeletons.

**Créer:** `components/wishlist-skeleton.tsx`
```tsx
export function WishlistSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
      </CardContent>
    </Card>
  );
}
```

### UX Mobile

#### 4. Pull to Refresh
Ajouter le pull-to-refresh sur le feed.

**Installation:**
```bash
npm install react-pull-to-refresh
```

#### 5. Bottom Sheet pour les Actions
Sur mobile, utiliser des bottom sheets au lieu de dropdowns.

**Installation:**
```bash
npx shadcn@latest add sheet
```

**Exemple:**
```tsx
<Sheet>
  <SheetTrigger>Actions</SheetTrigger>
  <SheetContent side="bottom">
    <SheetHeader>
      <SheetTitle>Options</SheetTitle>
    </SheetHeader>
    <div className="space-y-2">
      <Button variant="outline" className="w-full">
        Modifier
      </Button>
      <Button variant="destructive" className="w-full">
        Supprimer
      </Button>
    </div>
  </SheetContent>
</Sheet>
```

#### 6. FAB (Floating Action Button)
Sur mobile, ajouter un FAB pour créer une wishlist.

**Créer:** `components/fab.tsx`
```tsx
'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function FAB() {
  return (
    <Button
      asChild
      size="lg"
      className="fixed bottom-20 right-4 md:hidden rounded-full shadow-lg h-14 w-14 p-0 z-40"
    >
      <Link href="/wishlists/new">
        <Plus className="h-6 w-6" />
      </Link>
    </Button>
  );
}
```

#### 7. Swipe Actions
Swipe pour like/bookmark/réserver.

**Installation:**
```bash
npm install react-swipeable
```

### Formulaires

#### 8. Optimiser les formulaires mobiles
- Input de type approprié (email, tel, url)
- Autocomplete
- Labels clairs
- Validation en temps réel

**Exemple:**
```tsx
<Input
  type="email"
  inputMode="email"
  autoComplete="email"
  placeholder="vous@exemple.com"
/>

<Input
  type="tel"
  inputMode="tel"
  autoComplete="tel"
/>

<Input
  type="url"
  inputMode="url"
  autoComplete="url"
  placeholder="https://..."
/>
```

#### 9. Upload d'images mobile
Permettre de prendre une photo directement.

```tsx
<Input
  type="file"
  accept="image/*"
  capture="environment"  // Camera
/>
```

### Navigation

#### 10. Bottom Tab Bar (optionnel)
Ajouter une barre de navigation en bas sur mobile.

**Créer:** `components/bottom-nav.tsx`
```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav({ username }: { username?: string }) {
  const pathname = usePathname();

  const links = [
    { href: '/feed', icon: Home, label: 'Accueil' },
    { href: '/search', icon: Search, label: 'Recherche' },
    { href: '/wishlists/new', icon: PlusSquare, label: 'Créer' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
    { href: `/profile/${username}`, icon: User, label: 'Profil' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="flex justify-around items-center h-16">
        {links.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full',
              pathname === href ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className={cn('h-6 w-6', pathname === href && 'fill-current')} />
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

**Ajout dans layout:**
```tsx
// app/(main)/layout.tsx
<div className="pb-16 md:pb-0">
  {children}
</div>
<BottomNav username={user?.user_metadata?.username} />
```

### Performance avancée

#### 11. Service Worker / PWA
Transformer l'app en PWA installable.

**Créer:** `next.config.js`
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // ... existing config
});
```

#### 12. Prefetch des routes
```tsx
<Link href="/wishlists/new" prefetch>
  Créer une wishlist
</Link>
```

#### 13. Memoization des composants lourds
```tsx
import { memo } from 'react';

export const WishlistCard = memo(function WishlistCard({ wishlist }) {
  // ...
});
```

---

## 🎨 Design System Mobile

### Espacements
```css
/* Réduire sur mobile */
.container {
  @apply px-4 sm:px-6 lg:px-8;
}

.section-spacing {
  @apply py-8 sm:py-12 lg:py-16;
}
```

### Typography
```css
/* Responsive text */
.heading-1 {
  @apply text-2xl sm:text-3xl lg:text-4xl;
}

.heading-2 {
  @apply text-xl sm:text-2xl lg:text-3xl;
}

.body {
  @apply text-sm sm:text-base;
}
```

### Boutons
```tsx
// Taille minimale sur mobile
<Button size="lg" className="min-h-[44px] min-w-[44px]">
  Action
</Button>
```

---

## 📊 Métriques à surveiller

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Mobile-specific
- **Time to Interactive**: < 3.5s sur 3G
- **Total Blocking Time**: < 200ms
- **Speed Index**: < 3s

### Tools
- Lighthouse (Chrome DevTools)
- PageSpeed Insights
- WebPageTest

---

## 🔧 Tests sur Mobile

### Devices à tester
- iPhone SE (320px width)
- iPhone 12/13/14 (390px)
- iPhone Pro Max (428px)
- Android petit (360px)
- Android moyen (412px)
- Tablette (768px+)

### Orientations
- Portrait
- Paysage

### Scenarios
1. Feed → Clic wishlist → Voir items → Retour
2. Créer wishlist (avec photo)
3. Recherche
4. Notifications
5. Profil → Settings

---

## 🚀 Plan d'implémentation rapide

### Phase 1: Quick Wins (30 min)
1. ✅ Touch targets 44px minimum
2. Skeleton loaders
3. Image sizes attribute
4. Input types appropriés

### Phase 2: UX (1h)
1. Bottom navigation bar
2. FAB pour créer
3. Bottom sheets pour actions
4. Pull to refresh

### Phase 3: Performance (1h)
1. Pagination/infinite scroll
2. Memoization
3. Prefetch
4. Image optimization avancée

### Phase 4: PWA (optionnel, 2h)
1. Service worker
2. Manifest
3. Offline support
4. Install prompt

---

## ✅ Checklist Mobile

### Layout
- [x] Grid responsive
- [x] Header adaptatif
- [ ] Bottom nav bar
- [ ] FAB
- [ ] Safe areas (notch iOS)

### Touch
- [x] Boutons 44x44px min
- [ ] Swipe actions
- [ ] Pull to refresh
- [ ] Long press menus

### Images
- [x] Lazy loading
- [x] Aspect ratios
- [ ] Sizes attribute
- [ ] Responsive images
- [ ] Camera capture

### Formulaires
- [ ] Input types
- [ ] Autocomplete
- [ ] Validation temps réel
- [ ] Keyboard approprié

### Performance
- [ ] Pagination
- [ ] Infinite scroll
- [ ] Skeleton loaders
- [ ] Memoization
- [ ] Prefetch

### PWA
- [ ] Service worker
- [ ] Manifest
- [ ] Install prompt
- [ ] Offline support

---

## 💡 Astuces

1. **Debug mobile:** Chrome DevTools → Device Mode
2. **Test real device:** `npm run dev -- --host` puis accès via IP local
3. **Touch simulation:** Activer "Simulate touch events" dans DevTools
4. **Network throttling:** Tester en 3G slow
5. **Lighthouse:** Toujours tester en mode navigation privée

---

## 🆘 Problèmes courants

### Scroll horizontal indésirable
```css
/* Fix overflow */
body {
  overflow-x: hidden;
}

.container {
  max-width: 100vw;
  overflow-x: hidden;
}
```

### Zoom sur focus input (iOS)
```html
<!-- Dans head -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

OU mieux:
```css
input {
  font-size: 16px; /* Évite le zoom sur iOS */
}
```

### 300ms tap delay
```css
* {
  touch-action: manipulation;
}
```

### Safe area (notch iPhone)
```css
.header {
  padding-top: env(safe-area-inset-top);
}

.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## 📱 Résultat attendu

Après optimisations:
- ⚡ Chargement initial < 2s sur 4G
- ⚡ Navigation fluide 60fps
- 👆 Toutes les actions facilement tapables
- 📱 App-like experience
- 📴 Fonctionne hors ligne (si PWA)
- 🎨 UI adaptée à chaque taille d'écran

