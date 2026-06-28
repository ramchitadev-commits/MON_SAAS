'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { getCart, getCartTotal, clearCart, CartItem } from '@/lib/cart';
import { createOrder } from '@/lib/orders';
import { WaveLogo, OrangeMoneyLogo } from '@/components/logos';

interface DeliveryInfo {
  name: string;
  phone: string;
  zone: string;
  fee: number;
  address: string;
  note: string;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'wave' | 'orange_money' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const items = getCart(slug);
    if (items.length === 0) {
      router.push(`/${slug}`);
      return;
    }
    setCartItems(items);

    const saved = sessionStorage.getItem(`doole_delivery_${slug}`);
    if (!saved) {
      router.push(`/${slug}/livraison`);
      return;
    }
    setDeliveryInfo(JSON.parse(saved));
    setLoading(false);
  }, [slug, router]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const handlePayment = (provider: 'wave' | 'orange_money') => {
    if (!deliveryInfo || cartItems.length === 0) return;

    setSelectedProvider(provider);
    setProcessing(true);

    // Simulation de la transaction (2 secondes)
    setTimeout(async () => {
      try {
        const subtotal = getCartTotal(cartItems);
        const deliveryFee = deliveryInfo.fee;
        const total = subtotal + deliveryFee;
        const trackingToken = `token${Math.floor(100000 + Math.random() * 900000)}`;

        const items = cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          unitPrice: item.price,
          quantity: item.quantity,
        }));

        // Crée la commande + ses articles dans Supabase (l'id est généré par la base)
        const created = await createOrder({
          customerName: deliveryInfo.name,
          customerPhone: `+221 ${deliveryInfo.phone}`,
          deliveryZone: deliveryInfo.zone,
          deliveryAddress: deliveryInfo.address,
          deliveryNote: deliveryInfo.note || null,
          subtotal,
          deliveryFee,
          total,
          status: 'payee', // Directement payé pour le prototype
          paymentProvider: provider,
          paymentRef: `${provider.toUpperCase()}-TX-${Math.floor(100000 + Math.random() * 900000)}`,
          trackingToken,
          paidAt: new Date().toISOString(),
          items,
        });

        // Vide le panier de cette boutique
        clearCart(slug);

        // Redirige vers la confirmation
        router.push(`/${slug}/confirmation/${created.id}`);
      } catch (err) {
        console.error(err);
        setProcessing(false);
        alert("Le paiement n'a pas pu être enregistré. Vérifiez votre connexion et réessayez.");
      }
    }, 2000);
  };

  const cartSubtotal = getCartTotal(cartItems);
  const deliveryFee = deliveryInfo ? deliveryInfo.fee : 0;
  const totalAmount = cartSubtotal + deliveryFee;

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
            href={`/${slug}/livraison`}
            className="inline-flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 text-slate-700 transition-colors cursor-pointer h-11 w-11"
            title="Retour à la livraison"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-emerald-600" /> Paiement
          </span>
          <div className="w-11"></div>
        </div>
      </header>

      {/* Corps */}
      <main className="max-w-xl mx-auto px-4 py-6 relative">
        {processing && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-50 p-6 text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-400 mb-4"></div>
            <h3 className="text-lg font-black">
              Traitement du paiement en cours...
            </h3>
            <p className="text-sm text-slate-400 mt-2 max-w-xs leading-relaxed">
              Veuillez confirmer la transaction sur votre téléphone avec l'opérateur{' '}
              <span className="text-white font-bold uppercase">
                {selectedProvider === 'wave' ? 'Wave' : 'Orange Money'}
              </span>.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Récap de livraison */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-xs space-y-2.5">
            <h3 className="font-bold text-slate-400 uppercase tracking-wider">Récapitulatif de livraison</h3>
            <div className="text-slate-700 leading-relaxed">
              <span className="font-extrabold text-slate-900 block text-sm">{deliveryInfo?.name}</span>
              <span className="font-semibold">{deliveryInfo?.phone}</span>
              <br />
              <span className="font-bold">Quartier :</span> {deliveryInfo?.zone}
              <br />
              <span className="font-bold">Adresse :</span> {deliveryInfo?.address}
            </div>
          </div>

          {/* Boutons Opérateurs */}
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Sélectionnez un moyen de paiement
            </h3>

            <div className="grid gap-3">
              {/* WAVE BUTTON */}
              <button
                type="button"
                onClick={() => handlePayment('wave')}
                className="h-16 w-full bg-[#00A3E0] hover:bg-[#0092c9] text-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <WaveLogo className="h-9 w-auto" />
              </button>

              {/* ORANGE MONEY BUTTON */}
              <button
                type="button"
                onClick={() => handlePayment('orange_money')}
                className="h-16 w-full bg-black hover:bg-slate-950 text-[#FF6600] border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <OrangeMoneyLogo className="h-9 w-auto" />
              </button>
            </div>

            <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Transactions sécurisées directes
            </div>
          </div>

          {/* Ticket de caisse */}
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Votre Ticket</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Sous-total</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Frais de livraison</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-dashed border-slate-200">
                <span>Total à payer</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
