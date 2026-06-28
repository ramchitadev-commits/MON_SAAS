import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Wallet,
  Truck,
  Clock,
  ShieldCheck,
  TrendingUp,
  Share2,
  Store,
  Smartphone,
  Check,
  Quote,
  BadgeCheck,
  Bell,
  MapPin,
} from 'lucide-react';
import { DooleLogo } from '@/components/logos';

export const metadata: Metadata = {
  title: 'Doolé — Vends sur TikTok & Instagram, encaisse par Wave, livre sans effort',
  description:
    "Doolé transforme un DM Instagram ou TikTok en commande payée par Wave ou Orange Money et dispatchée à ton livreur — en moins de 5 minutes, sans taper un seul message. Gratuit pour démarrer.",
};

// Données de tarifs (voir planning_prd-doole.md, grille tarifaire).
const PLANS = [
  {
    name: 'Gratuit',
    price: '0',
    period: 'pour toujours',
    tagline: 'Pour démarrer et tester sans risque.',
    features: [
      'Boutique en ligne + lien partageable',
      "Jusqu'à 10 produits",
      'Paiement Wave / Orange Money direct',
      'Notification à chaque nouvelle commande',
      "30 commandes par mois",
    ],
    cta: 'Commencer gratuitement',
    highlighted: false,
  },
  {
    name: 'Starter',
    price: '3 000',
    oldPrice: '5 000',
    period: 'FCFA / mois',
    tagline: 'Quand les commandes décollent.',
    features: [
      'Tout le plan Gratuit, plus :',
      "Jusqu'à 50 produits",
      'Dispatch livreur automatique (1 livreur)',
      'Suivi de commande par SMS pour la cliente',
      'Tableau de bord jour / semaine / mois',
      '200 commandes par mois',
    ],
    cta: 'Choisir Starter',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '7 000',
    oldPrice: '10 000',
    period: 'FCFA / mois',
    tagline: 'Pour les boutiques établies.',
    features: [
      'Tout le plan Starter, plus :',
      'Produits illimités',
      'Livreurs illimités',
      'Top produits & zones de livraison illimitées',
      'Commandes illimitées',
      'Support prioritaire WhatsApp + appel',
    ],
    cta: 'Choisir Pro',
    highlighted: false,
  },
];

const STEPS = [
  {
    icon: Store,
    title: 'Crée ta boutique en 3 minutes',
    text: "Ton numéro de téléphone, le nom de ta boutique, ton numéro Wave ou Orange Money. C'est tout. Pas d'email, pas de carte bancaire.",
  },
  {
    icon: Share2,
    title: 'Partage ton lien en bio',
    text: 'Colle ton lien doole.sn dans ta bio TikTok ou Instagram. Tes clientes parcourent tes articles et commandent toutes seules, même la nuit.',
  },
  {
    icon: BadgeCheck,
    title: 'Reçois des commandes payées',
    text: "La cliente paie par Wave/OM, l'argent arrive direct chez toi, et ton livreur est prévenu automatiquement. Toi, tu ne tapes rien.",
  },
];

const FEATURES = [
  {
    icon: Wallet,
    title: 'Paiement Wave & Orange Money',
    text: "L'argent va directement sur ton compte. Doolé ne touche jamais à tes paiements.",
  },
  {
    icon: Truck,
    title: 'Dispatch livreur automatique',
    text: 'Dès le paiement confirmé, ton livreur reçoit un SMS/WhatsApp avec adresse et détails.',
  },
  {
    icon: Clock,
    title: 'Boutique ouverte 24h/24',
    text: 'Les commandes tombent même quand tu dors. Tu ne perds plus une vente le soir.',
  },
  {
    icon: ShieldCheck,
    title: 'Fini les fausses captures Wave',
    text: 'Seul le paiement réellement confirmé valide la commande. Zéro arnaque possible.',
  },
  {
    icon: TrendingUp,
    title: 'Ton chiffre d’affaires en un coup d’œil',
    text: 'Vois tes ventes du jour, de la semaine, du mois. Sache enfin combien tu gagnes.',
  },
  {
    icon: Bell,
    title: 'Suivi de commande pour la cliente',
    text: 'Ta cliente reçoit un lien de suivi par SMS. Plus de « ma commande est où ? ».',
  },
];

export default function LandingPage() {
  const primaryBtn =
    'inline-flex items-center justify-center gap-2 h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all';

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-slate-900 font-sans antialiased">
      {/* ───────── Header ───────── */}
      <header className="sticky top-0 z-50 bg-[#FCFCFB] border-b-2 border-slate-900">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <DooleLogo />
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#fonctionnement" className="hover:text-slate-900 transition-colors">
              Comment ça marche
            </a>
            <a href="#fonctionnalites" className="hover:text-slate-900 transition-colors">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="hover:text-slate-900 transition-colors">
              Tarifs
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/entrer"
              className="hidden sm:inline-flex items-center h-10 px-4 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/entrer"
              className="inline-flex items-center justify-center gap-1.5 h-12 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      {/* ───────── Hero ───────── */}
      <section className="max-w-6xl mx-auto px-5 pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-8 items-center">
          {/* Texte */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border-2 border-emerald-600 rounded-full px-3 py-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Conçu pour les vendeuses au Sénégal
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
              Transforme tes DM en commandes{' '}
              <span className="text-emerald-600">payées et livrées</span>.
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-md">
              Un seul lien dans ta bio. Tes clientes commandent, paient par Wave ou Orange
              Money, et ton livreur est prévenu — sans que tu tapes un seul message.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/entrer" className={primaryBtn}>
                Créer ma boutique gratuitement
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#fonctionnement"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm rounded-xl border-2 border-slate-900 transition-colors"
              >
                Voir comment ça marche
              </a>
            </div>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Gratuit pour démarrer
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Sans engagement
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Prêt en 3 minutes
              </span>
            </p>
          </div>

          {/* Mockup "reçu" type confirmation de commande */}
          <div className="relative">
            <div className="bg-white border-2 border-slate-900 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden max-w-sm mx-auto">
              <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
                <span className="font-black tracking-tight">doolé</span>
                <span className="text-xs text-slate-300">Boutique de Fatou</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center shrink-0">
                    <ShoppingBagGlyph />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate">Robe Wax « Fama »</div>
                    <div className="text-xs text-slate-500">Quantité : 1</div>
                  </div>
                  <div className="ml-auto font-black text-sm whitespace-nowrap">18 500 FCFA</div>
                </div>

                <div className="flex items-center gap-2 bg-[#00A3E0]/10 border-2 border-[#00A3E0] rounded-xl px-3 py-2.5">
                  <BadgeCheck className="h-5 w-5 text-[#00A3E0] shrink-0" />
                  <span className="text-sm font-bold text-slate-800">
                    Payé par Wave — confirmé
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 border-2 border-emerald-600 rounded-xl px-3 py-2.5">
                  <Truck className="h-5 w-5 text-emerald-700 shrink-0" />
                  <span className="text-sm font-bold text-slate-800">
                    Livreur Modou notifié 📦
                  </span>
                </div>

                <div className="text-center text-xs text-slate-400 pt-1">
                  Temps passé par la vendeuse : <span className="font-bold text-emerald-600">0 minute</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Avant / Après ───────── */}
      <section className="bg-white border-y-2 border-slate-900">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-center mb-10">
            Vendre ne devrait pas être un casse-tête
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {/* Avant */}
            <div className="border-2 border-slate-300 rounded-2xl p-6 bg-slate-50">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Aujourd&apos;hui, sans Doolé
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                {[
                  '30+ DM à traiter après chaque live',
                  'Des captures d’écran Wave falsifiables',
                  'Les commandes notées dans un cahier',
                  'Appeler le livreur pour chaque livraison',
                  'Aucune idée du chiffre d’affaires',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <span className="mt-0.5 h-4 w-4 rounded-full border-2 border-rose-400 text-rose-500 flex items-center justify-center text-[10px] font-black shrink-0">
                      ✕
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            {/* Après */}
            <div className="border-2 border-slate-900 rounded-2xl p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-4">
                Avec Doolé
              </div>
              <ul className="space-y-3 text-sm text-slate-800 font-medium">
                {[
                  'Un lien unique : les clientes commandent seules',
                  'Paiement confirmé en temps réel, zéro fraude',
                  'Toutes les commandes au même endroit',
                  'Livreur prévenu automatiquement',
                  'Ton CA du jour, de la semaine, du mois',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-600 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Comment ça marche ───────── */}
      <section id="fonctionnement" className="max-w-6xl mx-auto px-5 py-16 md:py-24 scroll-mt-20">
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            En 3 étapes
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            De ta bio à la livraison, sans effort
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-emerald-700" />
                  </div>
                  <span className="text-3xl md:text-4xl font-black text-slate-200 leading-none">{i + 1}</span>
                </div>
                <h3 className="font-bold text-lg mb-2 leading-snug">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ───────── Fonctionnalités ───────── */}
      <section id="fonctionnalites" className="bg-white border-y-2 border-slate-900 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-24">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Tout ce qu&apos;il te faut
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Une boutique complète, pensée pour ton téléphone
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="border-2 border-slate-200 rounded-2xl p-6 hover:border-slate-900 transition-colors"
                >
                  <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-base mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── Témoignage ───────── */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-5">
          {[
            {
              quote:
                "Avant je passais mes soirées à répondre aux DM et vérifier les captures Wave. Maintenant les commandes tombent toutes seules, déjà payées. J'ai retrouvé mon temps.",
              name: 'Fatou',
              role: 'Mode & accessoires · TikTok · Dakar',
            },
            {
              quote:
                "Mes deux livreurs reçoivent l'adresse automatiquement dès qu'une commande est payée. Je ne passe plus mes journées au téléphone. Mon assistante ne se trompe plus d'adresse.",
              name: 'Awa',
              role: 'Bijoux & wax · Instagram · Almadies',
            },
          ].map((t) => (
            <figure
              key={t.name}
              className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col"
            >
              <Quote className="h-7 w-7 text-emerald-600 mb-3" />
              <blockquote className="text-sm md:text-base text-slate-700 leading-relaxed flex-1">
                « {t.quote} »
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center border-2 border-black">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ───────── Tarifs ───────── */}
      <section id="tarifs" className="bg-white border-y-2 border-slate-900 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-24">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Tarifs
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Commence gratuitement, paie quand tu grandis
            </h2>
            <p className="text-sm text-slate-500">
              Sans engagement. Résiliable à tout moment. Paiement par Wave ou Orange Money.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-5 items-start">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 md:p-7 flex flex-col ${
                  plan.highlighted
                    ? 'bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] md:shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] md:-mt-4'
                    : 'bg-white border-2 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-black text-lg">{plan.name}</h3>
                  {plan.highlighted && (
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-1 rounded-full border-2 border-black">
                      Populaire
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">{plan.tagline}</p>
                <div className="mt-4 flex items-end gap-1.5">
                  {plan.oldPrice && (
                    <span className="text-sm text-slate-400 line-through mb-1">
                      {plan.oldPrice}
                    </span>
                  )}
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-xs text-slate-500 mb-1.5">{plan.period}</span>
                </div>
                <ul className="mt-5 space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 text-emerald-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/entrer"
                  className={`mt-6 inline-flex items-center justify-center gap-2 h-12 px-6 font-bold text-sm rounded-xl border-2 border-black transition-all ${
                    plan.highlighted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
                      : 'bg-white hover:bg-slate-50 text-slate-900'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/tarifs"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
            >
              Comparer les forfaits en détail
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── CTA final ───────── */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-24">
        <div className="bg-slate-900 text-white rounded-3xl border-2 border-black p-8 md:p-14 text-center shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]">
          <h2 className="text-2xl md:text-4xl font-black tracking-tight max-w-2xl mx-auto leading-tight">
            Prête à vendre sans stress, dès ce soir ?
          </h2>
          <p className="text-slate-300 text-sm md:text-base mt-4 max-w-md mx-auto">
            Crée ta boutique en 3 minutes et mets ton lien dans ta bio avant ton prochain live.
          </p>
          <Link
            href="/entrer"
            className="mt-8 inline-flex items-center justify-center gap-2 h-14 px-8 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-base rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,0.9)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
          >
            Créer ma boutique gratuitement
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="border-t-2 border-slate-900 bg-white">
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <DooleLogo />
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5" />
              Le social commerce, simplifié. Fait à Dakar 🇸🇳
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm font-bold text-slate-600">
            <a href="#tarifs" className="hover:text-slate-900 transition-colors">
              Tarifs
            </a>
            <Link href="/entrer" className="hover:text-slate-900 transition-colors">
              Se connecter
            </Link>
            {/* Accès démo conservé (choix "dashboard ouvert") */}
            <Link href="/accueil" className="hover:text-slate-900 transition-colors">
              Voir la démo
            </Link>
          </div>
        </div>
        <div className="border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-5 py-4 text-center text-xs text-slate-400">
            © 2026 Doolé. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Petit glyphe "sac" pour le mockup (évite une image externe).
function ShoppingBagGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
