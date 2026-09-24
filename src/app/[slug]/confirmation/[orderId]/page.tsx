'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Share2, Copy, Check, ArrowRight, Calendar } from 'lucide-react';
import { getOrderById } from '@/lib/orders';
import { Order } from '@/types';
import { DooleLogo } from '@/components/logos';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let pollingInterval: NodeJS.Timeout | null = null;

    const fetchOrder = async () => {
      try {
        const loadedOrder = await getOrderById(orderId);
        if (active && loadedOrder) {
          setOrder(loadedOrder);
          // Si le paiement est confirmé (status !== en_attente), arrête le polling
          if (loadedOrder.status !== 'en_attente') {
            if (pollingInterval) clearInterval(pollingInterval);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    // Charge la commande une première fois
    fetchOrder();

    // Si la commande est en_attente, lance un polling pour attendre la confirmation du webhook
    const timer = setTimeout(() => {
      if (active && order && order.status === 'en_attente') {
        pollingInterval = setInterval(fetchOrder, 2000); // Polling toutes les 2 secondes
      }
    }, 1000);

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [orderId]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const getTrackingUrl = () => {
    if (!order) return '';
    return `${window.location.origin}/suivi/${order.trackingToken}`;
  };

  const handleShare = async () => {
    const url = getTrackingUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Suivi de commande Doolé',
          text: `Suivez ma commande chez ${slug} sur Doolé !`,
          url: url,
        });
      } catch (err) {
        console.error('Erreur lors du partage:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FCFCFB]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FCFCFB] text-slate-900 font-sans flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle className="h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Commande introuvable</h2>
        <p className="text-sm text-slate-500 mt-1">L'identifiant de commande {orderId} n'existe pas.</p>
        <Link
          href={`/${slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:underline"
        >
          Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-slate-900 font-sans pb-12">
      {/* En-tête de confirmation */}
      <main className="max-w-xl mx-auto px-4 py-10 space-y-6">
        {order.status === 'en_attente' ? (
          <div className="bg-amber-50 border-2 border-amber-900 rounded-2xl p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-amber-900 leading-tight">
                Paiement en cours de confirmation ⏳
              </h2>
              <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">
                Numéro de Commande : #{order.id.slice(0, 8)}
              </p>
            </div>
            <p className="text-sm text-amber-800 leading-relaxed max-w-sm mx-auto">
              Veuillez confirmer la transaction sur votre téléphone. Cette page se mettra à jour automatiquement.
            </p>
          </div>
        ) : (
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-emerald-600 fill-emerald-50" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                Jërëjëf ! Commande validée 🎉
              </h2>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Numéro de Commande : #{order.id.slice(0, 8)}
              </p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Le paiement a bien été réceptionné par la vendeuse. Votre commande est enregistrée et sera traitée rapidement.
            </p>
          </div>
        )}

        {/* Lien de Suivi Flat Card */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Suivez votre colis</h3>
            <p className="text-xs text-slate-500 mt-1">
              Partagez ou conservez ce lien pour suivre l'état de la livraison en temps réel.
            </p>
          </div>

          <div className="flex items-center bg-slate-100 border-2 border-slate-900 rounded-xl p-2 gap-2">
            <span className="text-xs text-slate-600 font-mono select-all truncate flex-1 pl-2">
              {getTrackingUrl()}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(getTrackingUrl());
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer"
              title="Copier le lien"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex-1 h-12 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <Share2 className="h-4 w-4" /> Partager le lien
            </button>
            <Link
              href={`/suivi/${order.trackingToken}`}
              className="flex-1 h-12 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              Suivre le colis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Détails Commande Flat Card */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Détails de l'achat
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <span className="text-slate-400 text-xs ml-1.5">x{item.quantity}</span>
                </div>
                <span className="font-black text-slate-900">{formatPrice(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Sous-total</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Frais de livraison</span>
              <span>{formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-dashed border-slate-200">
              <span>Total payé via {order.paymentProvider === 'wave' ? 'Wave' : 'OM'}</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <Link
          href={`/${slug}`}
          className="h-12 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer flex items-center justify-center"
        >
          Retourner à la boutique
        </Link>
      </main>
    </div>
  );
}
