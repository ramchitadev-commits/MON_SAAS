'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShoppingCart, ShoppingBag, Search, X } from 'lucide-react';
import { getShopSettings } from '@/lib/settings';
import { getProductsByShopSlug } from '@/lib/products';
import { Product, ShopSettings } from '@/types';
import { getCart, getCartCount, getCartTotal, CartItem } from '@/lib/cart';

export default function StorefrontPage() {
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
        setSettings({
          name: slug ? slug.replace(/-/g, ' ').toUpperCase() : 'BOUTIQUE',
          description: 'Découvrez nos articles et commandez en ligne.',
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
        setProducts([]);
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
      <div className="flex items-center justify-center min-h-screen bg-slate-100/80">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 font-sans pb-28">
      {/* Container type Smartphone centré */}
      <div className="max-w-md mx-auto bg-white min-h-screen border-x border-slate-200/60 shadow-[5px_0px_10px_0px_rgba(0,0,0,0.1)]">

        {/* 1. Header Pro & Ancré */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3.5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                Boutique Vérifiée
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5 truncate pr-2">
              {settings.name}
            </h1>
            <p className="text-xs font-semibold text-slate-400">📍 Dakar, Sénégal</p>
          </div>

          <Link
            href={`/${slug}/panier`}
            className="relative p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shrink-0"
            title="Mon Panier"
          >
            <ShoppingCart className="w-5 h-5 text-slate-700" strokeWidth={2} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </header>

        <main className="p-4 space-y-4">

          {/* 2. Banner de Confiance & Paiement */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                Mode Premium • Service Express
              </span>
              <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full font-medium">
                ⚡️ 30 sec
              </span>
            </div>

            <h2 className="text-lg font-extrabold leading-snug">
              La mode à portée de clic
            </h2>

            <p className="text-xs text-slate-300 font-normal leading-relaxed">
              {settings.description || 'Commandez directement sans passer par les vocaux WhatsApp.'}
            </p>

            {/* Badges de paiements colorés Wave & Orange Money */}
            <div className="pt-2 border-t border-slate-700/80 flex items-center gap-2 flex-wrap">
              {settings.payoutProvider === 'wave' && (
                <span className="inline-flex items-center gap-1 bg-[#00C2FF]/15 text-[#00C2FF] border border-[#00C2FF]/30 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  🔵 Wave Direct
                </span>
              )}
              {settings.payoutProvider === 'orange_money' && (
                <span className="inline-flex items-center gap-1 bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  🟠 Orange Money
                </span>
              )}
              <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                🛵 Livraison 24h
              </span>
            </div>
          </div>

          {/* 3. Barre de recherche encadrée */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une robe, un sac..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl pl-10 pr-10 py-3 text-sm font-medium transition-all outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" strokeWidth={2} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Effacer"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* 4. Section Produits */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Articles disponibles
              </h3>
              <span className="text-xs font-semibold text-slate-400">{filteredProducts.length} article{filteredProducts.length > 1 ? 's' : ''}</span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid gap-3 grid-cols-2">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/${slug}/p/${product.id}`}
                    className="group flex flex-col bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:border-emerald-400 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all"
                  >
                    {/* Image Container — accepte n'importe quel ratio */}
                    <div className="relative w-full bg-slate-100 overflow-hidden" style={{ minHeight: '200px', aspectRatio: 'auto' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />

                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-xs font-bold text-white bg-black/50 px-2.5 py-1 rounded-lg">Rupture</span>
                        </div>
                      )}

                      {product.stock !== null && product.stock <= 3 && product.stock > 0 && (
                        <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                          {product.stock} restant
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3 space-y-2 flex flex-col flex-1">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                        {product.name}
                      </h4>
                      {product.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-auto pt-1">
                        <span className="text-sm font-extrabold text-emerald-700">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center mx-auto text-2xl">
                  🛍️
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {searchQuery ? 'Aucun article trouvé' : 'Aucun article pour le moment'}
                </p>
                <p className="text-xs text-slate-500 max-w-[220px] mx-auto">
                  {searchQuery
                    ? 'Essayez une autre recherche.'
                    : 'Les nouveautés arrivent très vite sur cette boutique !'}
                </p>
              </div>
            )}
          </div>

        </main>

        {/* 5. Bouton de Commande Ancré en bas */}
        {cartCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200/80 z-50">
            <div className="max-w-md mx-auto">
              <Link
                href={`/${slug}/panier`}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
                <span>Voir le panier · {formatPrice(cartTotal)}</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
