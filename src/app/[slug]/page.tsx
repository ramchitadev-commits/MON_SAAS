'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShoppingCart, ShoppingBag, ArrowRight, Tag, Search, X } from 'lucide-react';
import { getShopSettings, ShopSettings } from '@/lib/settings';
import { getProducts } from '@/lib/products';
import { Product } from '@/types';
import { getCart, getCartCount, getCartTotal, CartItem } from '@/lib/cart';
import { DooleLogo } from '@/components/logos';

export default function ShopfrontPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Panier (local) + paramètres boutique (Supabase)
    setCart(getCart(slug));
    getShopSettings().then(setSettings).catch((err) => console.error(err));

    // Charge les produits disponibles depuis Supabase
    getProducts()
      .then((allProducts) => setProducts(allProducts.filter((p) => p.isAvailable)))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    // Rafraîchit le panier / les paramètres en cas de retour arrière
    const handleFocus = () => {
      setCart(getCart(slug));
      getShopSettings().then(setSettings).catch((err) => console.error(err));
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [slug]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const cartCount = getCartCount(cart);
  const cartTotal = getCartTotal(cart);

  // Filtrage des produits selon la recherche
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Première lettre pour le logo rond
  const logoInitial = settings.name ? settings.name.charAt(0).toUpperCase() : 'D';

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-slate-900 font-sans pb-24">
      {/* Header Boutique */}
      <header className="sticky top-0 bg-white border-b border-slate-200 z-30 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-600 text-white rounded-xl border-2 border-black flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {logoInitial}
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900 leading-tight">
                {settings.name}
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Dakar, Sénégal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/${slug}/panier`}
              className="relative p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center justify-center h-11 w-11"
              title="Mon Panier"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-black min-w-5 h-5 px-1 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Profil de la boutique */}
      <section className="bg-slate-50 border-b border-slate-200 px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
            ✓ Paiement {settings.payoutProvider === 'wave' ? 'Wave' : 'Orange Money'} Direct
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Bienvenue chez {settings.name} ! ✨
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
            {settings.description}
          </p>
        </div>
      </section>

      {/* Liste des Produits */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Barre de recherche style Notion / Flat */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-white border-2 border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Tag className="h-4 w-4 text-emerald-600" /> Articles Disponibles ({filteredProducts.length})
          </h3>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border-2 border-slate-900 rounded-2xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex flex-col justify-between"
              >
                {/* Image */}
                <div className="relative aspect-video w-full bg-slate-100 border-b-2 border-slate-900 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'}
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                  {product.stock !== null && product.stock <= 3 && product.stock > 0 && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase border border-black shadow-sm">
                      Plus que {product.stock} !
                    </span>
                  )}
                </div>

                {/* Détails */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-base text-slate-900 line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {product.description || 'Aucune description fournie.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-base font-black text-slate-900">
                      {formatPrice(product.price)}
                    </div>
                    {product.stock === 0 ? (
                      <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 text-xs font-bold">
                        Rupture
                      </span>
                    ) : (
                      <Link
                        href={`/${slug}/p/${product.id}`}
                        className="h-10 inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 border border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer whitespace-nowrap"
                      >
                        Commander
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl text-center">
            <ShoppingBag className="h-12 w-12 text-slate-300 mb-2" />
            <h4 className="text-base font-bold text-slate-700">Aucun produit trouvé</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {searchQuery
                ? "Aucun article ne correspond à votre recherche actuelle."
                : "La boutique n'a aucun produit actif pour le moment."}
            </p>
          </div>
        )}
      </main>

      {/* Bouton Panier Flottant */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-40 md:max-w-md md:mx-auto">
          <Link
            href={`/${slug}/panier`}
            className="h-14 w-full flex items-center justify-between bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-emerald-400" />
              <span className="text-sm">Voir le panier</span>
              <span className="bg-emerald-600 text-white text-xs font-black h-6 min-w-6 px-1.5 rounded-full border border-black flex items-center justify-center">
                {cartCount}
              </span>
            </div>
            <span className="font-black text-sm">{formatPrice(cartTotal)}</span>
          </Link>
        </div>
      )}

      {/* Footer Doolé Branding */}
      <footer className="mt-12 py-8 border-t border-slate-200 text-center space-y-2">
        <div className="flex justify-center">
          <DooleLogo className="scale-90" />
        </div>
        <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
          Propulsé par Doolé SN — Boutique Express & Paiement Wave Direct
        </p>
      </footer>
    </div>
  );
}
