'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShoppingCart, ShoppingBag, Search, X, Zap, Check } from 'lucide-react';
import { getShopSettings, ShopSettings } from '@/lib/settings';
import { getProductsByShopSlug } from '@/lib/products';
import { Product } from '@/types';
import { getCart, getCartCount, getCartTotal, CartItem } from '@/lib/cart';

export default function ShopfrontPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCart(getCart(slug));
    getShopSettings(slug)
      .then(setSettings)
      .catch((err) => {
        console.error('Erreur getShopSettings:', err);
        // Fallback générique sans nom hardcodé pour respecter le multi-tenancy
        setSettings({
          name: slug ? slug.replace(/-/g, ' ').toUpperCase() : 'BOUTIQUE',
          description: 'Découvrez nos articles et commandez en ligne. Paiement par mobile money et livraison rapide à Dakar.',
          payoutPhone: '77 000 00 00',
          payoutProvider: 'wave',
          deliveryFee: 1500,
          logo: null,
          cutoffTime: '18:00',
        });
      });

    getProductsByShopSlug(slug)
      .then(setProducts)
      .catch((err) => {
        console.error('Erreur getProductsByShopSlug:', err);
        setProducts([
          {
            id: 'demo-1',
            name: 'Robe Dashiki Premium',
            description: 'Robe traditionnelle élégante en coton biologique',
            price: 45000,
            image: 'https://images.unsplash.com/photo-1595777707802-21b287da9d7f?w=500&h=500&fit=crop',
            isAvailable: true,
            stock: 2,
            shopId: slug,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'demo-2',
            name: 'Sac à main Tissu Wax',
            description: 'Accessoire élégant aux motifs traditionnels',
            price: 28000,
            image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop',
            isAvailable: true,
            stock: 5,
            shopId: slug,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'demo-3',
            name: 'Collier Perles Artisanal',
            description: 'Bijou unique fait à la main par des artisans sénégalais',
            price: 15000,
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop',
            isAvailable: true,
            stock: null,
            shopId: slug,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'demo-4',
            name: 'Écharpe Soie Naturelle',
            description: 'Écharpe légère et raffinée pour l\'été',
            price: 22000,
            image: 'https://images.unsplash.com/photo-1590121215346-8169c6cab826?w=500&h=500&fit=crop',
            isAvailable: true,
            stock: 3,
            shopId: slug,
            createdAt: new Date().toISOString(),
          },
        ]);
      })
      .finally(() => setLoading(false));

    const handleFocus = () => {
      setCart(getCart(slug));
      getShopSettings(slug).catch((err) => console.error(err));
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [slug]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const cartCount = getCartCount(cart);
  const cartTotal = getCartTotal(cart);

  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      p.name.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
  });

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FCFCFB]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-slate-900 font-sans pb-28">
      {/* HEADER — Épuré et élégant avec logotype raffiné */}
      <header className="sticky top-0 bg-[#FCFCFB] border-b-2 border-slate-200 z-30 px-4 py-5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Textuel Élégant */}
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-2xl md:text-2xl font-serif font-extrabold tracking-tight text-slate-900 leading-none">
              {settings.name || 'LA DIVA COLLECTION'}
            </h1>
            <span className="text-[9px] text-slate-400 font-light tracking-widest uppercase letter-spacing-wide">
              Dakar, Sénégal
            </span>
          </div>

          {/* Panier Icon — Épuré et accessible */}
          <Link
            href={`/${slug}/panier`}
            className="relative p-3 rounded-md hover:bg-slate-100 transition-all duration-200 cursor-pointer"
            title="Mon Panier"
          >
            <ShoppingCart className="h-6 w-6 text-slate-900" strokeWidth={1.25} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-slate-900 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* HERO SECTION — Minimaliste et impactant */}
      <section className="px-4 py-16 md:py-20 bg-[#FCFCFB]">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Badge de paiement — Discret mais visible */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-lg">
            <Check className="h-4 w-4 text-slate-900" strokeWidth={2.5} />
            <span className="text-xs font-medium text-slate-700 tracking-tight">
              Paiement Wave Direct &amp; Mobile Money
            </span>
          </div>

          {/* Titre principal — Typographie Serif élégante */}
          <h2 className="text-3xl md:text-5xl font-serif font-black tracking-tight text-slate-900 max-w-3xl leading-tight">
            La mode à portée de clic
          </h2>

          {/* Message d'accueil — Concis et engageant */}
          <p className="text-sm md:text-base text-slate-600 max-w-2xl leading-relaxed font-light">
            Commandez en quelques instants, payez par mobile money et faites-vous livrer. Mode premium, service express.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT — Recherche et Grille */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Barre de recherche — Minimaliste et épurée */}
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-300">
              <Search className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-md text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-300 hover:text-slate-500 transition-colors"
                aria-label="Effacer"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Section title — Discret mais informatif */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Articles disponibles ({filteredProducts.length})
            </h3>
          </div>
        </div>

        {/* GRILLE DE PRODUITS — Moderne et aérée */}
        {filteredProducts.length > 0 ? (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/${slug}/p/${product.id}`}
                className="group flex flex-col space-y-4 cursor-pointer"
              >
                {/* Image Container — Arrondi léger et effet de survol subtil */}
                <div className="relative aspect-square w-full bg-slate-50 rounded-md overflow-hidden border border-slate-100 transition-all group-hover:border-slate-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-103 transition-transform duration-500"
                  />

                  {/* Stock Badge — Discret et épuré */}
                  {product.stock !== null && product.stock <= 3 && product.stock > 0 && (
                    <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded">
                      Dernier(s) {product.stock}
                    </span>
                  )}

                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <span className="text-xs font-semibold text-slate-600">Rupture</span>
                    </div>
                  )}
                </div>

                {/* Product Info — Typographie claire et hiérarchisée */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-slate-700 transition-colors">
                    {product.name}
                  </h4>
                  {product.description && (
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {product.description}
                    </p>
                  )}

                  {/* Price & CTA — Alignement clair */}
                  <div className="flex items-baseline justify-between pt-2">
                    <span className="text-base font-bold text-slate-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.stock !== 0 && (
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors font-medium">
                        Commander →
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="h-14 w-14 text-slate-200 mb-4" strokeWidth={1} />
            <h4 className="text-sm font-semibold text-slate-700">Aucun produit trouvé</h4>
            <p className="text-xs text-slate-500 mt-2">
              {searchQuery
                ? "Essayez une autre recherche."
                : "Revenez bientôt pour découvrir nos articles."}
            </p>
          </div>
        )}
      </main>

      {/* STICKY CART BAR — Moderne, flottant et accessible */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#FCFCFB] border-t-2 border-slate-200 px-4 py-4 z-40 backdrop-blur-sm">
          <Link
            href={`/${slug}/panier`}
            className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 bg-slate-900 hover:bg-slate-800 active:translate-y-0.5 transition-all duration-150 text-white rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)]"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-sm font-semibold">Voir le panier</span>
              <span className="bg-white text-slate-900 text-xs font-bold px-2.5 py-0.5 rounded-full ml-2">
                {cartCount}
              </span>
            </div>
            <span className="text-base font-bold tracking-tight">
              {formatPrice(cartTotal)}
            </span>
          </Link>
        </div>
      )}

      {/* Footer — Discret et élégant */}
      <footer className="mt-24 py-10 border-t border-slate-200 text-center bg-white">
        <p className="text-[10px] text-slate-400 font-light tracking-widest uppercase">
          © {new Date().getFullYear()} {settings.name || 'LA DIVA COLLECTION'} · Dakar
        </p>
      </footer>
    </div>
  );
}
