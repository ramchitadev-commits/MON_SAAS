# 💻 Storefront Code Summary

## Architecture Générale

Le storefront est un composant React client (`'use client'`) qui affiche:
1. Une grille de produits responsive (3-4 colonnes)
2. Une barre de recherche avec filtrage temps réel
3. Un panier flottant sticky en bas
4. Un header sticky avec logo & panier

**Fichier principal** : `src/app/[slug]/page.tsx`

---

## 🎯 Composants Clés

### Header Sticky
```tsx
<header className="sticky top-0 bg-white border-b border-slate-100 z-30 px-4 py-4 shadow-sm">
  <div className="max-w-4xl mx-auto flex items-center justify-between">
    {/* Logo Textuel */}
    <div className="flex flex-col items-start">
      <h1 className="text-lg font-serif tracking-tight text-slate-900 font-bold">
        LA DIVA COLLECTION
      </h1>
      <span className="text-[10px] text-slate-400 tracking-widest font-light">
        DAKAR, SÉNÉGAL
      </span>
    </div>

    {/* Panier Icône */}
    <Link href={`/${slug}/panier`} className="relative p-3 hover:bg-slate-50 transition-colors">
      <ShoppingCart className="h-5 w-5 text-slate-900" strokeWidth={1.5} />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-bold h-5 w-5 rounded-full">
          {cartCount}
        </span>
      )}
    </Link>
  </div>
</header>
```

**Points clés** :
- `font-serif` pour élégance du logo
- `tracking-widest` pour espacement "DAKAR, SÉNÉGAL"
- `border-slate-100` au lieu de noir pour subtilité
- Badge noir sans bordure (épuré)

---

### Hero Section
```tsx
<section className="px-4 py-12 bg-white">
  <div className="max-w-4xl mx-auto space-y-4">
    {/* Badge d'annonce */}
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
      <Zap className="h-3.5 w-3.5 text-slate-700" strokeWidth={2.5} />
      <span className="text-xs font-medium text-slate-700">
        ✓ Paiement Wave Direct & Livraison Express
      </span>
    </div>

    {/* Titre Principal */}
    <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-slate-900 max-w-2xl leading-tight">
      La mode à portée de clic
    </h2>

    {/* Sous-titre */}
    <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
      Commandez en quelques instants, payez par mobile money et faites-vous livrer dans Dakar...
    </p>
  </div>
</section>
```

**Points clés** :
- Badge discret : bg-slate-50, border-slate-200
- Responsive text: text-3xl md:text-4xl
- Max-width limité pour lisibilité (max-w-2xl)

---

### Search Bar
```tsx
<div className="relative">
  <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-300">
    <Search className="h-4 w-4" strokeWidth={1.5} />
  </span>
  
  <input
    type="text"
    placeholder="Rechercher un article..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-lg text-sm 
               placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all"
  />
  
  {searchQuery && (
    <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-4">
      <X className="h-4 w-4" strokeWidth={2} />
    </button>
  )}
</div>
```

**Points clés** :
- Bordure fine : border-slate-200, rounded-lg (pas de shadow)
- Focus ring subtil : ring-1 ring-slate-300
- Icône X pour clear, en absolu à droite

---

### Product Grid (Responsif)
```tsx
<div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
  {filteredProducts.map((product) => (
    <Link href={`/${slug}/p/${product.id}`} className="group flex flex-col space-y-3 cursor-pointer">
      
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-slate-50 rounded-lg overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />

        {/* Stock Badge */}
        {product.stock !== null && product.stock <= 3 && (
          <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded">
            Dernier(s) {product.stock}
          </span>
        )}

        {/* Rupture Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <span className="text-xs font-semibold text-slate-600">Rupture</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-2 group-hover:translate-x-0.5 transition-transform">
        <h4 className="text-sm font-medium text-slate-900 line-clamp-2">
          {product.name}
        </h4>
        {product.description && (
          <p className="text-xs text-slate-500 line-clamp-1">
            {product.description}
          </p>
        )}

        {/* Price & CTA */}
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-base font-semibold text-slate-900">
            {formatPrice(product.price)}
          </span>
          {product.stock !== 0 && (
            <span className="text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors">
              Commander →
            </span>
          )}
        </div>
      </div>
    </Link>
  ))}
</div>
```

**Points clés** :
- `grid gap-6 sm:grid-cols-3 lg:grid-cols-4` : 1 col mobile → 3 tablet → 4 desktop
- `aspect-square` : ratio cohérent
- `group-hover:scale-105` : zoom subtil image
- `group-hover:translate-x-0.5` : décalage texte au hover
- Badge noir épuré, overlay pour rupture

---

### Sticky Cart Bar
```tsx
{cartCount > 0 && (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 z-40">
    <Link
      href={`/${slug}/panier`}
      className="max-w-4xl mx-auto flex items-center justify-between px-5 py-4 
                 bg-slate-900 hover:bg-slate-800 transition-colors text-white rounded-xl"
    >
      {/* Gauche : Panier + Count */}
      <div className="flex items-center gap-2.5">
        <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
        <span className="text-sm font-medium">Voir le panier</span>
        <span className="bg-white text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
          {cartCount}
        </span>
      </div>

      {/* Droite : Total */}
      <span className="text-base font-semibold tracking-tight">
        {formatPrice(cartTotal)}
      </span>
    </Link>
  </div>
)}
```

**Points clés** :
- Fixed bottom + bg-white border-top : survole pas le contenu
- Container intérieur max-w-4xl centré
- Badge panier : inverted colors (white bg / dark text)
- Total bien en vue (font-semibold, droite)

---

## 🔍 Fonctionnalités

### Search Temps Réel
```tsx
const filteredProducts = products.filter((p) => {
  const query = searchQuery.toLowerCase().trim();
  if (!query) return true;
  return (
    p.name.toLowerCase().includes(query) ||
    (p.description && p.description.toLowerCase().includes(query))
  );
});
```

### Format Prix (Locale FR)
```tsx
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};
```

### Gestion Fallback Supabase
```tsx
useEffect(() => {
  getShopSettings()
    .then(setSettings)
    .catch((err) => {
      console.error(err);
      // Fallback aux settings par défaut
      setSettings({
        name: 'LA DIVA COLLECTION',
        description: '...',
        payoutPhone: '77 123 45 67',
        payoutProvider: 'wave',
        deliveryFee: 1500,
        cutoffTime: '18:00',
      });
    });

  getProducts()
    .then((allProducts) => setProducts(allProducts.filter((p) => p.isAvailable)))
    .catch((err) => {
      // Fallback aux produits de démo
      setProducts(DEMO_PRODUCTS);
    })
    .finally(() => setLoading(false));
}, [slug]);
```

---

## 📊 Statistiques Design

| Aspect | Valeur |
|--------|--------|
| **Colonnes Desktop** | 4 (lg:grid-cols-4) |
| **Colonnes Tablet** | 3 (sm:grid-cols-3) |
| **Colonnes Mobile** | 1 (défaut) |
| **Gap Grille** | 24px (gap-6) |
| **Border Color** | slate-100/200 (jamais 900) |
| **Shadow Max** | shadow-sm (très subtil) |
| **Rounded Max** | rounded-lg/rounded-xl |
| **Font Serif** | Logo uniquement |
| **Font Weight Titles** | font-semibold |
| **Font Weight Buttons** | font-bold |

---

## 🎨 Palette Tailwind Utilisée

```css
/* Backgrounds */
bg-white, bg-slate-50

/* Borders */
border-slate-100, border-slate-200

/* Text */
text-slate-900, text-slate-600, text-slate-500, text-slate-400, text-slate-300

/* Actions */
bg-slate-900, hover:bg-slate-800, text-white

/* Accents */
- Aucun gradient
- Aucun shadow aggressif
- Aucun color primaire saturé (Wave/Orange discrèts)
```

---

## 🚀 Performance Notes

✅ **Pas de librairies de composants** (Radix, DaisyUI, etc.)  
✅ **Tailwind CSS direct** (bundle léger)  
✅ **Images Unsplash** (fallbacks via src)  
✅ **Client-side search** (pas d'API calls)  
✅ **Lazy load images** (Next.js Image future)  

---

## 📂 Fichiers Adjacents

- `src/lib/settings.ts` : getShopSettings(), DEFAULT_SETTINGS
- `src/lib/products.ts` : getProducts(), filtering
- `src/lib/cart.ts` : getCart(), getCartCount(), getCartTotal()
- `src/types.ts` : Product, ShopSettings interfaces

---

**Version** : 1.0 | **Date** : Juillet 2026  
**Framework** : Next.js 15 + React 19 + Tailwind 4
