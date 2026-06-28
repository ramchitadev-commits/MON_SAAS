'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ShoppingCart } from 'lucide-react';
import { getCart, updateCartQuantity, removeFromCart, getCartTotal, CartItem } from '@/lib/cart';

export default function CartPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCartItems(getCart(slug));
    setLoading(false);
  }, [slug]);

  const handleQtyChange = (productId: string, newQty: number) => {
    const updated = updateCartQuantity(slug, productId, newQty);
    setCartItems(updated);
  };

  const handleRemove = (productId: string) => {
    const updated = removeFromCart(slug, productId);
    setCartItems(updated);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const totalAmount = getCartTotal(cartItems);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FCFCFB]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 z-30 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href={`/${slug}`}
            className="inline-flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 text-slate-700 transition-colors cursor-pointer h-11 w-11"
            title="Retour à la boutique"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <ShoppingCart className="h-4 w-4 text-emerald-600" /> Mon Panier
          </span>
          <div className="w-11"></div> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 py-6">
        {cartItems.length > 0 ? (
          <div className="space-y-6">
            {/* Liste des Articles dans des Cartes Flat */}
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex gap-4 items-center"
                >
                  {/* Miniature Image */}
                  <div className="h-16 w-16 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Infos & Contrôles */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black text-slate-900">
                        {formatPrice(item.price)}
                      </div>
                      
                      {/* Qty Counter */}
                      <div className="flex items-center border border-black rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => handleQtyChange(item.productId, item.quantity - 1)}
                          className="p-1.5 hover:bg-slate-200 transition-colors h-7 w-7 flex items-center justify-center border-r border-black cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2.5 font-bold text-xs text-slate-900 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQtyChange(item.productId, item.quantity + 1)}
                          className="p-1.5 hover:bg-slate-200 transition-colors h-7 w-7 flex items-center justify-center border-l border-black cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total et Validation Card Notion */}
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <div className="flex justify-between items-center text-sm font-bold border-b border-dashed border-slate-200 pb-3">
                <span className="text-slate-500 uppercase tracking-wider text-xs">Sous-total</span>
                <span className="text-base font-black text-slate-900">
                  {formatPrice(totalAmount)}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Les frais de livraison seront calculés à l'étape suivante selon votre quartier à Dakar.
              </p>
              <Link
                href={`/${slug}/livraison`}
                className="h-12 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Passer à la livraison
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl text-center space-y-4">
            <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto" />
            <div>
              <h4 className="text-base font-bold text-slate-700">Votre panier est vide</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Vous n'avez pas encore d'articles dans votre panier.
              </p>
            </div>
            <Link
              href={`/${slug}`}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              Retourner à la boutique
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
