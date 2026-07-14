'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShoppingCart, ShoppingBag, Search, X, MapPin, Zap } from 'lucide-react';
import { getShopSettings, ShopSettings } from '@/lib/settings';
import { getProducts } from '@/lib/products';
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
    getShopSettings()
      .then(setSettings)
      .catch((err) => {
        console.error('Erreur getShopSettings:', err);
        // En cas d'erreur, utiliser les paramètres par défaut
        setSettings({
          name: 'LA DIVA COLLECTION',
          description: 'La mode à portée de clic. Commandez en quelques instants, payez par mobile money et faites-vous livrer dans Dakar. Mode premium, service express.',
          payoutPhone: '77 123 45 67',
          payoutProvider: 'wave',
          deliveryFee: 1500,
          logo: null,
          cutoffTime: '18:00',
        });
      });

    getProducts()
      .then((allProducts) => setProducts(allProducts.filter((p) => p.isAvailable)))
      .catch((err) => {
        console.error('Erreur getProducts:', err);
        // En cas d'erreur, utiliser des produits de démo
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
      getShopSettings().catch((err) => console.error(err));
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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-24">
      {/* HEADER — Épuré et élégant */}
      <header className="sticky top-0 bg-white border-b border-slate-100 z-30 px-4 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex flex-col items-start">
            <h1 className="text-lg font-serif tracking-tight text-slate-900 font-bold leading-tight">
              {settings.name || 'LA DIVA COLLECTION'}
            </h1>
            <span className="text-[10px] text-slate-400 tracking-widest font-light">
              DAKAR, SÉNÉGAL
            </span>
          </div>

          {/* Panier Icon */}
          <Link
            href={`/${slug}/panier`}
            className="relative p-3 hover:bg-slate-50 transition-colors cursor-pointer rounded-lg"
            title="Mon Panier"
          >
            <ShoppingCart className="h-5 w-5 text-slate-900" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* HERO SECTION — Minimaliste et inspirant */}
      <section className="px-4 py-12 bg-white">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
            <Zap className="h-3.5 w-3.5 text-slate-700" strokeWidth={2.5} />
            <span className="text-xs font-medium text-slate-700 tracking-tight">
              ✓ Paiement {settings.payoutProvider === 'wave' ? 'Wave' : 'Orange Money'} Direct & Livraison Express
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-slate-900 max-w-2xl leading-tight">
            La mode à portée de clic
          </h2>

          <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
            Commandez en quelques instants, payez par mobile money et faites-vous livrer dans Dakar. Mode premium, service express.
          </p>
        </div>
      </section>

      {/* SEARCH & FILTERS */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Barre de recherche minimaliste */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-300">
            <Search className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all"
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

        {/* Section title */}
        <div className="flex items-center justify-between pt-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Articles disponibles ({filteredProducts.length})
          </h3>
        </div>

        {/* GRILLE DE PRODUITS */}
        {filteredProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/${slug}/p/${product.id}`}
                className="group flex flex-col space-y-3 cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative aspect-square w-full bg-slate-50 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Stock Badge */}
                  {product.stock !== null && product.stock <= 3 && product.stock > 0 && (
                    <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded">
                      Dernier(s) {product.stock}
                    </span>
                  )}

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

                  {/* Price */}
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
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingBag className="h-12 w-12 text-slate-200 mb-3" strokeWidth={1} />
            <h4 className="text-sm font-medium text-slate-700">Aucun produit trouvé</h4>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? "Essayez une autre recherche."
                : "Revenez bientôt pour découvrir nos articles."}
            </p>
          </div>
        )}
      </main>

      {/* STICKY CART BAR — Moderne et élégant */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 z-40">
          <Link
            href={`/${slug}/panier`}
            className="max-w-4xl mx-auto flex items-center justify-between px-5 py-4 bg-slate-900 hover:bg-slate-800 transition-colors text-white rounded-xl"
          >
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-sm font-medium">Voir le panier</span>
              <span className="bg-white text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                {cartCount}
              </span>
            </div>
            <span className="text-base font-semibold tracking-tight">
              {formatPrice(cartTotal)}
            </span>
          </Link>
        </div>
      )}

      {/* Footer discret */}
      <footer className="mt-16 py-8 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 font-light tracking-widest uppercase">
          © {new Date().getFullYear()} {settings.name || 'LA DIVA COLLECTION'} · Dakar
        </p>
      </footer>
    </div>
  );
}
