'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  MapPin, 
  FileText, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle,
  HelpCircle,
  User,
  ShoppingBag,
  CreditCard
} from 'lucide-react';
import { getOrderById, updateOrder } from '@/lib/orders';
import { getCouriers } from '@/lib/couriers';
import { getShopSettings } from '@/lib/settings';
import { WaveLogo, OrangeMoneyLogo } from '@/components/logos';
import { Order, Courier, OrderStatus } from '@/types';

export default function DetailCommandePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState('');
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState('votre boutique');

  useEffect(() => {
    let active = true;
    getShopSettings()
      .then((settings) => {
        if (active) setShopName(settings.name);
      })
      .catch((err) => console.error(err));

    Promise.all([getOrderById(orderId), getCouriers()])
      .then(([loadedOrder, loadedCouriers]) => {
        if (!active) return;
        if (loadedOrder) {
          setOrder(loadedOrder);
          if (loadedOrder.courierId) {
            setSelectedCourierId(loadedOrder.courierId);
          }
        }
        setCouriers(loadedCouriers);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Commande introuvable</h2>
        <p className="text-sm text-slate-500 mt-1">L'identifiant {orderId} n'existe pas.</p>
        <button
          onClick={() => router.push('/commandes')}
          className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:underline cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Retour aux commandes
        </button>
      </div>
    );
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Dispatch du livreur
  const handleDispatch = async () => {
    if (!selectedCourierId) return;
    const selectedCourier = couriers.find(c => c.id === selectedCourierId);
    if (!selectedCourier) return;

    const updatedOrder: Order = {
      ...order,
      status: 'en_route',
      courierId: selectedCourierId,
      dispatchedAt: new Date().toISOString(),
    };

    try {
      const saved = await updateOrder(updatedOrder);
      setOrder(saved);
      setShowDispatchModal(false);

      // Notification simulée
      alert(
        `Livreur "${selectedCourier.name}" notifié par ${
          selectedCourier.channel === 'whatsapp' ? 'WhatsApp' : 'SMS'
        } !\n\nContenu du message :\n"Nouvelle livraison 📦\nClient: ${order.customerName} (${order.customerPhone})\nAdresse: ${order.deliveryZone} - ${order.deliveryAddress}\nMontant à percevoir: ${formatPrice(order.total)}"`
      );
    } catch (err) {
      console.error(err);
      alert('Le dispatch a échoué. Vérifiez votre connexion et réessayez.');
    }
  };

  // Transition de statut
  const handleStatusChange = async (newStatus: OrderStatus) => {
    const updatedOrder: Order = {
      ...order,
      status: newStatus,
      paidAt: newStatus === 'livre' ? new Date().toISOString() : order.paidAt,
    };
    try {
      const saved = await updateOrder(updatedOrder);
      setOrder(saved);
    } catch (err) {
      console.error(err);
      alert('La mise à jour du statut a échoué. Vérifiez votre connexion et réessayez.');
    }
  };

  const activeCourier = couriers.find(c => c.id === order.courierId);

  return (
    <div className="space-y-6">
      {/* Retour et Statut Principal */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.push('/commandes')}
          className="inline-flex items-center justify-center p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono font-bold">
            #{order.id.slice(0, 8)}
          </span>
          {order.status === 'en_attente' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              En attente
            </span>
          )}
          {order.status === 'payee' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Payée
            </span>
          )}
          {order.status === 'en_route' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              En route
            </span>
          )}
          {order.status === 'livre' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-slate-100">
              Livrée
            </span>
          )}
          {order.status === 'annulee' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              Annulée
            </span>
          )}
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Colonne gauche (Infos client + items) */}
        <div className="md:col-span-2 space-y-6">
          {/* Fiche Client */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4" /> Informations Client
            </h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="text-lg font-black text-slate-900">{order.customerName}</h4>
                <p className="text-sm text-slate-500 font-semibold">{order.customerPhone}</p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${order.customerPhone}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                >
                  <Phone className="h-4 w-4 text-emerald-600" />
                  Appeler
                </a>
                <a
                  href={`https://wa.me/${order.customerPhone.replace(/[\s+]/g, '')}?text=${encodeURIComponent(`Bonjour ${order.customerName}, c'est ${shopName}. Votre commande Doolé est prête.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba56] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Zone de livraison :</span> {order.deliveryZone}
                  <br />
                  <span className="font-bold text-slate-800">Adresse exacte :</span> {order.deliveryAddress}
                </div>
              </div>

              {order.deliveryNote && (
                <div className="flex items-start gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                  <FileText className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-xs text-slate-600">
                    <span className="font-bold text-slate-800 block mb-0.5">Note de livraison :</span>
                    {order.deliveryNote}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fiche Articles */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Articles Commandés
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{item.name}</h5>
                    <p className="text-xs text-slate-400">
                      {formatPrice(item.unitPrice)} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Frais de livraison</span>
                <span>{formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-dashed border-slate-200">
                <span>Total à payer</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite (Paiement & Gestion de statut) */}
        <div className="space-y-6">
          {/* reçu Wave ou Orange Money */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Statut du Paiement
            </h3>

            {order.paymentProvider === 'wave' ? (
              <div className="bg-[#00A3E0]/5 border border-[#00A3E0]/20 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <WaveLogo className="h-7 w-auto" />
                  <span className="text-[10px] font-bold text-[#00A3E0] bg-[#00A3E0]/15 px-2 py-0.5 rounded-full uppercase">
                    Payé Direct
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Montant reçu</div>
                  <div className="text-xl font-black text-[#00A3E0]">
                    {formatPrice(order.total)}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200/50 space-y-1.5 text-[11px] text-slate-500">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono font-bold text-slate-700">{order.paymentRef || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reçu le :</span>
                    <span className="font-bold text-slate-700">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-600 font-bold mt-1">
                    <span>Webhook Status :</span>
                    <span className="bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px]">
                      CONFIRMÉ
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <OrangeMoneyLogo className="h-7 w-auto" />
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full uppercase">
                    Payé Direct
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Montant reçu</div>
                  <div className="text-xl font-black text-orange-600">
                    {formatPrice(order.total)}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200/50 space-y-1.5 text-[11px] text-slate-500">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono font-bold text-slate-700">{order.paymentRef || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reçu le :</span>
                    <span className="font-bold text-slate-700">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-600 font-bold mt-1">
                    <span>Webhook Status :</span>
                    <span className="bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px]">
                      CONFIRMÉ
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Workflow de statut */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4" /> Traitement Logistique
            </h3>

            {/* Si en attente de dispatch */}
            {(order.status === 'payee' || order.status === 'en_attente') && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Le paiement a été confirmé. Vous devez maintenant attribuer cette livraison à l'un de vos livreurs.
                </p>
                <button
                  onClick={() => setShowDispatchModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Truck className="h-4 w-4" />
                  Dispatcher le livreur
                </button>
              </div>
            )}

            {/* Si déjà dispatché */}
            {order.status === 'en_route' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 space-y-2">
                  <div className="text-[10px] text-blue-500 uppercase font-bold tracking-wider">Livreur Assigné</div>
                  <div className="text-sm font-bold text-slate-800">{activeCourier?.name || 'Inconnu'}</div>
                  <div className="text-xs text-slate-500">{activeCourier?.phone}</div>
                  
                  {activeCourier && (
                    <a
                      href={`https://wa.me/${activeCourier.phone.replace(/[\s+]/g, '')}?text=Bonjour%20${encodeURIComponent(activeCourier.name)},%20voici%20la%20livraison%20pour%20${encodeURIComponent(order.customerName)}%20à%20${encodeURIComponent(order.deliveryZone)}.%20Montant%20à%20percevoir:%20${order.total}%20FCFA`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                    >
                      <MessageSquare className="h-3 w-3" /> Relancer via WhatsApp
                    </a>
                  )}
                </div>
                
                <button
                  onClick={() => handleStatusChange('livre')}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  Marquer comme Livrée
                </button>
              </div>
            )}

            {/* Si livré */}
            {order.status === 'livre' && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold uppercase tracking-wider">Livraison Réussie</h5>
                  <p className="text-xs text-emerald-700">
                    Cette commande a été marquée comme livrée avec succès par le livreur.
                  </p>
                </div>
              </div>
            )}

            {/* Si annulé */}
            {order.status === 'annulee' && (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-4 flex items-start gap-3">
                <XCircle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold uppercase tracking-wider">Commande Annulée</h5>
                  <p className="text-xs text-rose-700">
                    Cette commande a été annulée et retirée de la logistique active.
                  </p>
                </div>
              </div>
            )}

            {/* Bouton d'annulation (si pas déjà livré ou annulé) */}
            {order.status !== 'livre' && order.status !== 'annulee' && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    if (confirm('Voulez-vous vraiment annuler cette commande ?')) {
                      handleStatusChange('annulee');
                    }
                  }}
                  className="w-full py-2 text-xs font-bold text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all cursor-pointer"
                >
                  Annuler la commande
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal / BottomSheet de sélection de livreur */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center sm:items-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-slide-up">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Attribuer à un livreur</h3>
              <button 
                onClick={() => setShowDispatchModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                Fermer
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Choisir le livreur
                </label>
                <div className="grid gap-2">
                  {couriers.map((courier) => (
                    <button
                      key={courier.id}
                      onClick={() => setSelectedCourierId(courier.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                        selectedCourierId === courier.id
                          ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-900">{courier.name}</div>
                        <div className="text-xs text-slate-500">{courier.phone}</div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                        {courier.channel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setShowDispatchModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDispatch}
                  disabled={!selectedCourierId}
                  className={`flex-1 py-3 text-white font-bold text-sm rounded-xl cursor-pointer ${
                    selectedCourierId 
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md active:scale-95' 
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  Confirmer le dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
