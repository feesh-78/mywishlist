'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const CATEGORIES = [
  // Mode & Vêtements
  'Mode',
  'Vêtements',
  'Chaussures',
  'Accessoires',
  'Bijoux',
  'Montres',
  'Sacs',
  'Lunettes',

  // Tech & Électronique
  'Tech',
  'Informatique',
  'Téléphonie',
  'Audio',
  'Photo',
  'Vidéo',
  'Gaming',
  'Consoles',
  'Logiciels',
  'Applications',

  // Maison & Déco
  'Déco',
  'Maison',
  'Mobilier',
  'Électroménager',
  'Luminaires',
  'Textiles',
  'Rangement',

  // Sport & Loisirs
  'Sport',
  'Fitness',
  'Running',
  'Cyclisme',
  'Football',
  'Basketball',
  'Tennis',
  'Natation',
  'Yoga',
  'Musculation',
  'Sports nautiques',
  'Sports d\'hiver',
  'Randonnée',
  'Camping',

  // Beauté & Santé
  'Beauté',
  'Maquillage',
  'Soins',
  'Parfums',
  'Coiffure',
  'Hygiène',
  'Bien-être',

  // Cuisine & Alimentation
  'Cuisine',
  'Ustensiles',
  'Vaisselle',
  'Électroménager cuisine',
  'Alimentation',
  'Vins',
  'Café & Thé',

  // Culture & Divertissement
  'Livres',
  'BD & Mangas',
  'Musique',
  'Films',
  'Séries',
  'Jeux',
  'Jeux de société',
  'Puzzles',

  // Voyage & Extérieur
  'Voyage',
  'Bagages',
  'Outdoor',
  'Jardin',

  // Automobile & Véhicules
  'Automobile',
  'Moto',
  'Vélo',
  'Pièces auto',
  'Accessoires auto',

  // Enfants & Bébé
  'Enfants',
  'Bébé',
  'Jouets',
  'Puériculture',

  // Animaux
  'Animaux',
  'Chiens',
  'Chats',

  // Autre
  'Autre',
];

interface CategoryAutocompleteProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function CategoryAutocomplete({ value, onValueChange }: CategoryAutocompleteProps) {
  const [inputValue, setInputValue] = React.useState(value || '');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);

  // Filtrer les catégories en fonction de l'input
  const filteredCategories = React.useMemo(() => {
    if (!inputValue || inputValue.length === 0) return CATEGORIES;

    const searchTerm = inputValue.toLowerCase();
    return CATEGORIES.filter((category) =>
      category.toLowerCase().includes(searchTerm)
    );
  }, [inputValue]);

  // Mettre à jour l'input quand la valeur change de l'extérieur
  React.useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value]);

  // Gérer la sélection
  const handleSelect = (category: string) => {
    setInputValue(category);
    onValueChange(category);
    setShowSuggestions(false);
    setFocusedIndex(-1);
  };

  // Gérer le changement d'input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    setFocusedIndex(-1);
  };

  // Gérer les touches clavier
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredCategories.length === 0) {
      if (e.key === 'Enter') {
        // Créer une nouvelle catégorie
        onValueChange(inputValue);
        setShowSuggestions(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredCategories.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredCategories.length) {
          handleSelect(filteredCategories[focusedIndex]);
        } else {
          // Créer une nouvelle catégorie
          onValueChange(inputValue);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFocusedIndex(-1);
        break;
    }
  };

  // Fermer les suggestions quand on clique ailleurs
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder="Commencez à taper... (ex: Foo → Football)"
        className="w-full"
      />

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border rounded-md shadow-lg max-h-60 overflow-hidden"
        >
          {filteredCategories.length > 0 ? (
            <ScrollArea className="h-full max-h-60">
              <div className="p-1">
                {filteredCategories.map((category, index) => (
                  <button
                    key={category}
                    type="button"
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-sm text-sm transition-colors flex items-center gap-2',
                      index === focusedIndex
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                      value === category && 'font-semibold'
                    )}
                    onClick={() => handleSelect(category)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    {value === category && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                    <span>{category}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-4 text-sm text-center">
              <p className="text-muted-foreground mb-2">
                Aucune catégorie trouvée.
              </p>
              <p className="text-xs text-muted-foreground">
                Appuyez sur <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border">Entrée</kbd> pour créer &quot;{inputValue}&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
