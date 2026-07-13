'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Archive, CheckCircle, XCircle } from 'lucide-react';
import { getProducts, saveProduct } from '@/lib/products';
import { Product } from '@/types';

export default function ProduitsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProducts();
    // Recharge les produits chaque fois que la page devient visible (après onboarding)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProducts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // Met à jour la disponibilité du produit dans localStorage
  const handleToggleAvailability = async (product: Product) => {
    const updatedProduct = {
      ...product,
      isAvailable: !product.isAvailable
    };

    // Mise à jour optimiste
    setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));

    try {
      await saveProduct(updatedProduct);
    } catch (err) {
      console.error(err);
      // En cas d'échec, on annule la mise à jour optimiste
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      alert('La mise à jour a échoué. Vérifiez votre connexion et réessayez.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            Mon Catalogue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez vos articles, leurs prix et leur visibilité publique.
          </p>
        </div>
        <Link
          href="/produits/nouveau"
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Link>
      </div>

      {/* Liste de Produits */}
      {products.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                product.isAvailable ? 'border-slate-200' : 'border-slate-200 opacity-70 bg-slate-50/50'
              }`}
            >
              {/* Image & Edit button overlay */}
              <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
                <Link
                  href={`/produits/${product.id}`}
                  className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-xs hover:bg-white text-slate-700 hover:text-emerald-600 rounded-xl transition-colors shadow-md border border-slate-100"
                  title="Modifier l'article"
                >
                  <Edit2 className="h-4 w-4" />
                </Link>
                {!product.isAvailable && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
                    <span className="bg-slate-950 text-white font-bold text-xs px-3 py-1.5 rounded-full tracking-wider uppercase">
                      Masqué de la boutique
                    </span>
                  </div>
                )}
              </div>

              {/* Contenu */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 line-clamp-1">
                      {product.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {product.description || 'Aucune description fournie.'}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-base font-black text-slate-900">
                    {formatPrice(product.price)}
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    {product.stock === null ? (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Stock Illimité
                      </span>
                    ) : product.stock > 0 ? (
                      <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        {product.stock} en stock
                      </span>
                    ) : (
                      <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 font-bold">
                        Rupture
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bar (Toggle dispo) */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  {product.isAvailable ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-emerald-500" /> Disponible
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-slate-400" /> Indisponible
                    </>
                  )}
                </span>
                
                {/* Custom Toggle Switch */}
                <button
                  type="button"
                  onClick={() => handleToggleAvailability(product)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    product.isAvailable ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                  aria-label="Changer la disponibilité"
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      product.isAvailable ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl text-center">
          <Archive className="h-12 w-12 text-slate-300 mb-2" />
          <h3 className="text-base font-bold text-slate-700">Aucun produit dans le catalogue</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Ajoutez votre premier produit pour qu'il soit visible sur votre boutique en ligne.
          </p>
          <Link
            href="/produits/nouveau"
            className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" /> Ajouter mon premier produit
          </Link>
        </div>
      )}
    </div>
  );
}
