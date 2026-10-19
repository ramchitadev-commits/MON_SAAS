'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle, Truck, Package, MessageSquare, Phone } from 'lucide-react';
import { getTrackingOrder } from '@/lib/orders';
import { Order } from '@/types';
import { DooleLogo } from '@/components/logos';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [courier, setCourier] = useState<{ name: string; phone: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Rafraîchissement de la commande par son token
    const loadOrder = () =>
      getTrackingOrder(token)
        .then((found) => {
          if (!active || !found) return;
          setOrder(found.order);
          setCourier(found.courier);
        })
        .catch((err) => console.error(err));

    getTrackingOrder(token)
      .then((found) => {
        if (!active || !found) return;
        setOrder(found.order);
        setCourier(found.courier);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) setLoading(false);
      });

    // Rafraîchit toutes les 3 secondes pour simuler le temps réel
    const interval = setInterval(loadOrder, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [token]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <Package className="h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Lien de suivi invalide</h2>
        <p className="text-sm text-slate-500 mt-1">
          Aucune commande ne correspond à ce jeton de suivi.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:underline cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
      </div>
    );
  }

  const assignedCourier = courier;

  // Construction des étapes de la frise chronologique
  const steps = [
    {
      title: 'Commande Enregistrée',
      desc: 'Votre commande a été reçue et validée.',
      isCompleted: true,
      date: order.createdAt,
    },
    {
      title: 'Paiement Confirmé',
      desc: `Payé par ${order.paymentProvider === 'wave' ? 'Wave' : 'Orange Money'}.`,
      isCompleted: order.status !== 'en_attente',
      date: order.paidAt || order.createdAt,
    },
    {
      title: 'En cours de livraison',
      desc: assignedCourier 
        ? `Remis au livreur ${assignedCourier.name}.`
        : 'Préparation du colis pour la livraison.',
      isCompleted: order.status === 'en_route' || order.status === 'livre',
      date: order.dispatchedAt || undefined,
    },
    {
      title: 'Livrée',
      desc: 'Le colis a été remis au destinataire.',
      isCompleted: order.status === 'livre',
      date: order.status === 'livre' ? order.paidAt : undefined, // Utilise la date de livraison théorique
    },
  ];

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 z-30 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 text-slate-700 transition-colors cursor-pointer h-11 w-11"
            title="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Package className="h-4 w-4 text-emerald-600" /> Suivi Colis
          </span>
          <div className="w-11"></div>
        </div>
      </header>

      {/* Main Panel */}
      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* En-tête commande */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-2">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Commande #{order.id.slice(0, 8)}
              </h2>
              <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">
                Quartier : {order.deliveryZone}
              </p>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-slate-900 block">
                {formatPrice(order.total)}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                Payé
              </span>
            </div>
          </div>
        </div>

        {/* Alerte Annulation */}
        {order.status === 'annulee' && (
          <div className="bg-rose-50 border-2 border-rose-300 text-rose-950 p-4 rounded-2xl shadow-[3px_3px_0px_0px_rgba(225,29,72,1)] flex items-start gap-3">
            <div className="bg-rose-500 text-white rounded-lg p-1.5">
              <ArrowLeft className="h-5 w-5 transform rotate-45" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm">Commande Annulée</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Cette commande a été annulée par la boutique. Veuillez contacter le support si vous pensez qu'il s'agit d'une erreur.
              </p>
            </div>
          </div>
        )}

        {/* Frise chronologique (Timeline) */}
        {order.status !== 'annulee' && (
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              État de l'acheminement
            </h3>

            <div className="relative border-l-2 border-slate-200 ml-3.5 pl-6 space-y-8">
              {steps.map((step, idx) => {
                const Icon = idx === 0 || idx === 1 ? CheckCircle : idx === 2 ? Truck : Package;
                return (
                  <div key={idx} className="relative">
                    {/* Indicateur de point sur la frise */}
                    <span
                      className={`absolute -left-[39px] top-0 flex items-center justify-center rounded-full border-2 border-black h-8 w-8 shadow-sm transition-all ${
                        step.isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>

                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between gap-4">
                        <h4
                          className={`text-sm font-extrabold ${
                            step.isCompleted ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {step.title}
                        </h4>
                        {step.date && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDate(step.date)}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs ${
                          step.isCompleted ? 'text-slate-600' : 'text-slate-400'
                        }`}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Détails du Livreur assigné */}
        {order.status === 'en_route' && assignedCourier && (
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-emerald-600" /> Votre Livreur Tiak-Tiak
            </h3>

            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{assignedCourier.name}</h4>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{assignedCourier.phone}</p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${assignedCourier.phone}`}
                  className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl transition-all h-11 w-11 flex items-center justify-center"
                  title="Appeler le livreur"
                >
                  <Phone className="h-4 w-4 text-emerald-600" />
                </a>
                <a
                  href={`https://wa.me/${assignedCourier.phone.replace(/[\s+]/g, '')}?text=Bonjour%20${encodeURIComponent(assignedCourier.name)},%20je%20suis%20le%20destinataire%20de%20la%20commande%20Doolé%20%23${order.id.slice(0, 8)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#25D366] hover:bg-[#20ba56] text-white rounded-xl transition-all h-11 w-11 flex items-center justify-center shadow-sm"
                  title="WhatsApp"
                >
                  <MessageSquare className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Résumé adresse de livraison */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-xs space-y-2">
          <h3 className="font-bold text-slate-400 uppercase tracking-wider">Adresse de livraison confirmée</h3>
          <p className="text-slate-600 leading-relaxed">
            <span className="font-extrabold text-slate-900 block text-sm">{order.customerName}</span>
            <span className="font-bold">Quartier :</span> {order.deliveryZone}
            <br />
            <span className="font-bold">Adresse exacte :</span> {order.deliveryAddress}
          </p>
        </div>

        {/* Boutique Retour branding */}
        <footer className="text-center py-6">
          <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
            Propulsé par Doolé SN
          </p>
        </footer>
      </main>
    </div>
  );
}
