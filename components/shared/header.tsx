'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/lib/hooks/use-toast';
import {
  Heart,
  Home,
  Settings,
  LogOut,
  User,
  Search,
  Menu,
  ShoppingBag,
  Lock,
  Info,
  Shield,
  Mail,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationCenter } from '@/components/notification-center';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { data: user, isLoading } = useUser();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast({
      title: 'Déconnexion réussie',
      description: 'À bientôt !',
    });
    router.push('/login');
    router.refresh();
  }

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background pt-safe">
      <div className="container mx-auto px-4 pt-8">
        <div className="flex h-12 items-center justify-between max-w-6xl mx-auto">
          {/* Logo */}
          <Link href="/feed" className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MyWishList
            </span>
          </Link>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get('q') as string;
                if (query) {
                  router.push(`/search?q=${encodeURIComponent(query)}`);
                }
              }}
              className="relative w-full"
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                name="q"
                placeholder="Rechercher utilisateurs, collections, catégories..."
                className="w-full rounded-lg border bg-background px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </form>
          </div>

          {/* Navigation */}
          {isLoading ? (
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            </div>
          ) : user ? (
            <nav className="flex items-center gap-4">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/feed"
                  className={cn(
                    "transition-colors hover:text-primary",
                    isActive('/feed') && "text-primary"
                  )}
                >
                  <Home className={cn("h-6 w-6", isActive('/feed') && "fill-current")} />
                </Link>
                <Link
                  href="/search"
                  className={cn(
                    "transition-colors hover:text-primary",
                    isActive('/search') && "text-primary"
                  )}
                >
                  <Search className={cn("h-6 w-6", isActive('/search') && "fill-current")} />
                </Link>
                {/* <NotificationCenter userId={user.id} /> */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          @{user.user_metadata?.username || 'utilisateur'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.user_metadata?.username}`} className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Mon profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlists" className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        Mes wishlists
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.user_metadata?.username}?tab=shopping`} className="cursor-pointer">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Mes achats
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Paramètres
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/reset-password" className="cursor-pointer">
                        <Lock className="mr-2 h-4 w-4" />
                        Changer le mot de passe
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings/about" className="cursor-pointer">
                        <Info className="mr-2 h-4 w-4" />
                        À propos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings/privacy" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Confidentialité
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings/contact" className="cursor-pointer">
                        <Mail className="mr-2 h-4 w-4" />
                        Contact
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings/legal" className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        Mentions légales
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile Navigation */}
              <div className="flex md:hidden items-center gap-4">
                {/* <NotificationCenter userId={user.id} /> */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/feed" className="cursor-pointer">
                        <Home className="mr-2 h-4 w-4" />
                        Feed
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/search" className="cursor-pointer">
                        <Search className="mr-2 h-4 w-4" />
                        Rechercher
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.user_metadata?.username}`} className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Mon profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlists" className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        Mes wishlists
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.user_metadata?.username}?tab=shopping`} className="cursor-pointer">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Mes achats
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Paramètres
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/reset-password" className="cursor-pointer">
                        <Lock className="mr-2 h-4 w-4" />
                        Changer le mot de passe
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings/about" className="cursor-pointer">
                        <Info className="mr-2 h-4 w-4" />
                        À propos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings/privacy" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Confidentialité
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings/contact" className="cursor-pointer">
                        <Mail className="mr-2 h-4 w-4" />
                        Contact
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings/legal" className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        Mentions légales
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </nav>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Connexion</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">S&apos;inscrire</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
