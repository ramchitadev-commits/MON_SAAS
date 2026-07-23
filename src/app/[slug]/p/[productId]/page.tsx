'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus, ShoppingCart, ShoppingBag, CheckCircle } from 'lucide-react';
import { getProductByIdAndSlug } from '@/lib/products';
import { Product } from '@/types';
import { addToCart, getCart } from '@/lib/cart';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getProductByIdAndSlug(productId, slug)
      .then((p) => {
        if (active && p) setProduct(p);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId, slug]);

  const handleIncrement = () => {
    if (product && product.stock !== null && quantity >= product.stock) {
      return; // Limite par rapport au stock
    }
    setQuantity((q) => q + 1);
  };

  const handleDecrement = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(slug, product.id, product.name, product.price, product.image, quantity);
    
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      // Redirige vers le panier ou retourne à la boutique
      router.push(`/${slug}`);
    }, 1500);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FCFCFB]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FCFCFB] text-slate-900 font-sans flex flex-col items-center justify-center p-6 text-center">
        <ShoppingBag className="h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Article introuvable</h2>
        <p className="text-sm text-slate-500 mt-1">Ce produit n'existe pas ou a été retiré.</p>
        <Link
          href={`/${slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à la boutique
        </Link>
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
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Détails de l'article
          </span>
          <div className="w-11"></div> {/* Spacer to center the title */}
        </div>
      </header>

      {/* Détail Produit */}
      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Card interactive style flat */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          {/* Image — accepte n'importe quel ratio (1:1, 3:4, 16:9, etc) */}
          <div className="relative bg-slate-100 border-b-2 border-slate-900 overflow-hidden" style={{ aspectRatio: 'auto' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'}
              alt={product.name}
              className="object-cover w-full h-full"
              style={{ minHeight: '300px' }}
            />
          </div>

          {/* Corps */}
          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h2>
              <div className="text-lg font-black text-slate-900">
                {formatPrice(product.price)}
              </div>
            </div>

            {/* Description Notion Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Description
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {product.description || 'Aucune description fournie pour cet article.'}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Disponibilité
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {product.stock === null ? (
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                    Stock Illimité
                  </span>
                ) : product.stock > 0 ? (
                  <span className="text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                    {product.stock} articles restants
                  </span>
                ) : (
                  <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold">
                    Rupture de Stock
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Quantité & Ajouter au panier */}
        {product.stock !== 0 && (
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Sélectionnez la quantité</span>
              <div className="flex items-center border-2 border-black rounded-xl overflow-hidden bg-slate-50 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                <button
                  onClick={handleDecrement}
                  className="p-3 hover:bg-slate-200 transition-colors cursor-pointer border-r-2 border-black flex items-center justify-center h-11 w-11"
                  type="button"
                  aria-label="Diminuer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-5 font-bold text-base text-slate-900 w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="p-3 hover:bg-slate-200 transition-colors cursor-pointer border-l-2 border-black flex items-center justify-center h-11 w-11"
                  type="button"
                  aria-label="Augmenter"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {added ? (
              <div className="h-12 w-full bg-emerald-100 text-emerald-950 border-2 border-emerald-500 rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Article ajouté au panier !
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="h-12 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
                type="button"
              >
                <ShoppingCart className="h-4 w-4" />
                Ajouter au Panier — {formatPrice(product.price * quantity)}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
