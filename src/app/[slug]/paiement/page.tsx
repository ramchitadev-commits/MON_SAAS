'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { getCart, getCartTotal, clearCart, CartItem } from '@/lib/cart';
import { createOrderAndInitiatePayment } from '@/lib/actions';
import { WaveLogo, OrangeMoneyLogo } from '@/components/logos';
import { BUTTON_WAVE, BUTTON_ORANGE_MONEY } from '@/lib/designTokens';

interface DeliveryInfo {
  name: string;
  phone: string;
  zone: string;
  fee: number;
  address: string;
  note: string;
  gpsLocation?: string;
  deliveryDate?: string;
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
  const [stockError, setStockError] = useState<string | null>(null);

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

  const getDeliveryDateForOrder = (baseDeliveryDate: string | undefined): string | null => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Si après 18h00, force la date de livraison à demain
    if (currentTime >= '18:00') {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      return tomorrowStr;
    }

    // Sinon, utilise la date fournie ou aujourd'hui
    if (baseDeliveryDate) {
      return baseDeliveryDate;
    }

    const todayStr = now.toISOString().split('T')[0];
    return todayStr;
  };

  const handlePayment = (provider: 'wave' | 'orange_money') => {
    if (!deliveryInfo || cartItems.length === 0) return;

    setSelectedProvider(provider);
    setProcessing(true);

    (async () => {
      try {
        const finalDeliveryDate = getDeliveryDateForOrder(deliveryInfo.deliveryDate);
        const cleanPhone = deliveryInfo.phone.replace(/\s/g, '');
        const formattedPhone = cleanPhone.startsWith('+221') ? cleanPhone : `+221${cleanPhone}`;

        const { checkoutUrl } = await createOrderAndInitiatePayment({
          shopSlug: slug,
          customerName: deliveryInfo.name,
          customerPhone: formattedPhone,
          deliveryZone: deliveryInfo.zone,
          deliveryAddress: deliveryInfo.address,
          deliveryNote: deliveryInfo.note || null,
          gpsLocation: deliveryInfo.gpsLocation || null,
          deliveryDate: finalDeliveryDate,
          paymentProvider: provider,
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        });

        // Vide le panier de cette boutique
        clearCart(slug);

        // Redirige vers le checkout Moneroo (Wave/Orange Money)
        window.location.href = checkoutUrl;
      } catch (err) {
        console.error('Erreur détaillée de paiement:', err);
        setProcessing(false);

        let errorMessage = 'Erreur inconnue';
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'object' && err !== null && 'message' in err) {
          errorMessage = String((err as Record<string, unknown>).message);
        }

        // Si erreur de stock, afficher un message plus clair à l'écran
        if (errorMessage.includes('Stock insuffisant') || errorMessage.includes('stock')) {
          setStockError(errorMessage);
        } else {
          alert(`Le paiement n'a pas pu être enregistré.\n\nDétails: ${errorMessage}`);
        }
      }
    })();
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
        {stockError && (
          <div className="mb-4 bg-rose-50 border-2 border-rose-500 rounded-2xl p-4 text-rose-900 text-sm font-semibold shadow-[2px_2px_0px_0px_rgba(244,63,94,0.3)]">
            <div className="font-bold mb-1">⚠️ Stock indisponible</div>
            <div className="text-xs">{stockError}</div>
            <button
              onClick={() => {
                setStockError(null);
                router.push(`/${slug}/panier`);
              }}
              className="mt-3 inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 border border-rose-900 rounded-lg transition-all"
            >
              Retour au panier
            </button>
          </div>
        )}

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
                className={BUTTON_WAVE}
              >
                <WaveLogo className="h-9 w-auto" />
              </button>

              {/* ORANGE MONEY BUTTON */}
              <button
                type="button"
                onClick={() => handlePayment('orange_money')}
                className={BUTTON_ORANGE_MONEY}
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
