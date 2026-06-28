'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ShoppingBag, 
  Share2, 
  PlusCircle, 
  ArrowRight, 
  ClipboardList, 
  Users, 
  Copy, 
  Check,
  Sparkles,
  Truck
} from 'lucide-react';
import { getShopSettings, ShopSettings } from '@/lib/settings';
import { getOrders } from '@/lib/orders';
import { Order } from '@/types';

export default function AccueilPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [copied, setCopied] = useState(false);
  // Évite le mismatch d'hydratation : on attend le montage avant de lire
  // les données client (localStorage, window.location).
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Charge les commandes et les paramètres depuis Supabase
    const loadOrders = () => getOrders().then(setOrders).catch((err) => console.error(err));
    const loadSettings = () => getShopSettings().then(setSettings).catch((err) => console.error(err));
    loadOrders();
    loadSettings();

    // Rafraîchit régulièrement
    const interval = setInterval(() => {
      loadOrders();
      loadSettings();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Calcul du CA du jour (commandes payée ou livrée créées aujourd'hui)
  const calculateDailyRevenue = () => {
    const today = new Date().toDateString();
    return orders
      .filter(o => {
        const orderDate = new Date(o.createdAt).toDateString();
        const isValidStatus = o.status === 'payee' || o.status === 'livre' || o.status === 'en_route';
        return orderDate === today && isValidStatus;
      })
      .reduce((sum, o) => sum + o.total, 0);
  };

  // Commandes à traiter (statut payee ou en_attente)
  const ordersToProcess = orders.filter(
    o => o.status === 'payee' || o.status === 'en_attente'
  );

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // Slug dynamique pour la boutique
  const shopSlug = settings ? settings.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'boutique';
  // Tant que le composant n'est pas monté, on rend la même valeur que le serveur
  // (`doole.sn`) pour garantir un premier rendu client identique au HTML serveur.
  const shopUrl =
    mounted && typeof window !== 'undefined'
      ? `${window.location.origin}/${shopSlug}`
      : `https://doole.sn/${shopSlug}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: settings ? settings.name : 'Ma Boutique sur Doolé',
          text: 'Découvrez mes articles disponibles et commandez directement en ligne !',
          url: shopUrl,
        });
      } catch (err) {
        console.error('Erreur lors du partage:', err);
      }
    } else {
      // Fallback : copie dans le presse-papier
      navigator.clipboard.writeText(shopUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Salutations */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            Dalal ak jamm, Fatou 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Voici les performances de votre boutique **{settings?.name}** pour aujourd'hui.
          </p>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Share2 className="h-4 w-4" />
          Partager ma boutique
        </button>
      </div>

      {/* Grid Cartes Principales */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* CA du Jour */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
            <TrendingUp className="h-40 w-40" />
          </div>
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="h-4 w-4" />
            Chiffre d'Affaires du Jour
          </div>
          <div className="text-3xl font-black mt-3 md:text-4xl">
            {formatPrice(calculateDailyRevenue())}
          </div>
          <p className="text-xs text-emerald-100/80 mt-2">
            Ventes encaissées et expédiées aujourd'hui.
          </p>
        </div>

        {/* Commandes à traiter */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <ShoppingBag className="h-4 w-4 text-amber-500" />
              Commandes à traiter
            </div>
            <div className="text-3xl font-black mt-3 text-slate-900 md:text-4xl">
              {ordersToProcess.length}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Commandes payées ou en attente de validation/livraison.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              href="/commandes"
              className="flex items-center justify-between text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors group"
            >
              <span>Voir les commandes</span>
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Partager le lien en bio (Sénégal social selling helper) */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="max-w-md">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400" />
            Attirez des acheteurs depuis TikTok & Instagram
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Mettez votre lien Doolé dans la biographie de vos profils sociaux. Vos clients pourront commander et payer directement par Wave/OM sans passer 20 minutes à échanger des messages.
          </p>
          <div className="mt-4 flex items-center bg-slate-800 border border-slate-700 rounded-xl p-2.5 gap-2">
            <span className="text-xs text-slate-300 font-mono select-all truncate flex-1 pl-2">
              {shopUrl}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shopUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors cursor-pointer text-slate-200"
              title="Copier le lien"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Raccourcis / Actions rapides */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
          Actions rapides
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/produits/nouveau"
            className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-sm transition-all group"
          >
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-emerald-100 transition-colors">
              <PlusCircle className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-slate-700 text-center">Ajouter produit</span>
          </Link>
          <Link
            href="/commandes"
            className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-sm transition-all group"
          >
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-100 transition-colors">
              <ClipboardList className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-slate-700 text-center">Toutes les commandes</span>
          </Link>
          <Link
            href="/produits"
            className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-sm transition-all group"
          >
            <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-amber-100 transition-colors">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-slate-700 text-center">Gérer le catalogue</span>
          </Link>
          <Link
            href="/livreurs"
            className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-sm transition-all group"
          >
            <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-100 transition-colors">
              <Truck className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-slate-700 text-center">Mes Livreurs</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
