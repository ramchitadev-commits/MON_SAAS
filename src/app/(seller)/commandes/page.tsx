'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Calendar, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle, 
  Truck, 
  XCircle, 
  HelpCircle 
} from 'lucide-react';
import { getOrders } from '@/lib/orders';
import { Order, OrderStatus } from '@/types';

type FilterType = 'toutes' | 'a_traiter' | 'en_route' | 'livrees' | 'annulees';

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('a_traiter');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = () => getOrders().then(setOrders).catch((err) => console.error(err));
    load();
    // Rafraîchit
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filtrage des commandes
  const filteredOrders = orders.filter((order) => {
    // 1. Filtrage par statut
    let matchesStatus = false;
    switch (activeFilter) {
      case 'toutes':
        matchesStatus = true;
        break;
      case 'a_traiter':
        matchesStatus = order.status === 'payee' || order.status === 'en_attente';
        break;
      case 'en_route':
        matchesStatus = order.status === 'en_route';
        break;
      case 'livrees':
        matchesStatus = order.status === 'livre';
        break;
      case 'annulees':
        matchesStatus = order.status === 'annulee';
        break;
    }

    // 2. Filtrage par recherche (nom ou numéro de téléphone ou ID de commande)
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Tri des commandes (les plus récentes d'abord)
  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Définition du pillule de statut
  const getStatusPill = (status: OrderStatus) => {
    switch (status) {
      case 'en_attente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <HelpCircle className="h-3 w-3" />
            En attente
          </span>
        );
      case 'payee':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="h-3 w-3" />
            Payée
          </span>
        );
      case 'en_route':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="h-3 w-3" />
            En route
          </span>
        );
      case 'livre':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 text-slate-100">
            <CheckCircle className="h-3 w-3 text-emerald-400" />
            Livrée
          </span>
        );
      case 'annulee':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3" />
            Annulée
          </span>
        );
      default:
        return null;
    }
  };

  // Mini icône de paiement
  const renderPaymentBadge = (provider: 'wave' | 'orange_money') => {
    if (provider === 'wave') {
      return (
        <span className="inline-flex items-center justify-center bg-[#00A3E0] text-white text-[9px] font-black tracking-tight px-1.5 py-0.5 rounded shadow-sm">
          WAVE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center bg-black text-[#FF6600] text-[9px] font-black tracking-tight px-1.5 py-0.5 rounded shadow-sm border border-slate-800">
        OM
      </span>
    );
  };

  const filters: { key: FilterType; label: string; count: number }[] = [
    { 
      key: 'a_traiter', 
      label: 'À traiter', 
      count: orders.filter(o => o.status === 'payee' || o.status === 'en_attente').length 
    },
    { 
      key: 'en_route', 
      label: 'En route', 
      count: orders.filter(o => o.status === 'en_route').length 
    },
    { 
      key: 'livrees', 
      label: 'Livrées', 
      count: orders.filter(o => o.status === 'livre').length 
    },
    { 
      key: 'annulees', 
      label: 'Annulées', 
      count: orders.filter(o => o.status === 'annulee').length 
    },
    { 
      key: 'toutes', 
      label: 'Toutes', 
      count: orders.length 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
          Gestion des Commandes
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Suivez et traitez les commandes de vos clients en temps réel.
        </p>
      </div>

      {/* Barre de Recherche */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
          <Search className="h-5 w-5" />
        </span>
        <input
          type="text"
          placeholder="Rechercher par client, téléphone ou n° de commande..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-sm"
        />
      </div>

      {/* Onglets Filtres (Scrollable sur mobile) */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none md:mx-0 md:px-0">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
              activeFilter === filter.key
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{filter.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeFilter === filter.key ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-500'
            }`}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Liste des Commandes */}
      <div className="space-y-3">
        {sortedOrders.length > 0 ? (
          sortedOrders.map((order) => (
            <Link
              key={order.id}
              href={`/commandes/${order.id}`}
              className="block bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.99] group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      #{order.id.slice(0, 8)}
                    </span>
                    {getStatusPill(order.status)}
                    {renderPaymentBadge(order.paymentProvider)}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {order.customerName}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                  <div className="text-base font-black text-slate-900">
                    {formatPrice(order.total)}
                  </div>
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                    Détails
                    <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="truncate max-w-[70%]">
                  <span className="font-semibold text-slate-600">Articles :</span>{' '}
                  {order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                </div>
                <div>
                  <span className="font-semibold text-slate-600">Quartier :</span>{' '}
                  {order.deliveryZone}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl text-center">
            <AlertCircle className="h-12 w-12 text-slate-300 mb-2" />
            <h3 className="text-base font-bold text-slate-700">Aucune commande trouvée</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {searchQuery 
                ? "Aucun résultat ne correspond à votre recherche."
                : `Il n'y a pas de commandes dans la catégorie "${filters.find(f => f.key === activeFilter)?.label}".`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
