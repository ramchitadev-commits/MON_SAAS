import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { DooleLogo } from '@/components/logos';

export const metadata: Metadata = {
  title: 'Tarifs — Doolé | Gratuit, Starter (3 000 FCFA) et Pro (7 000 FCFA)',
  description:
    'Des tarifs simples et sans engagement pour ta boutique Doolé. Commence gratuitement, passe à Starter (3 000 FCFA/mois) ou Pro (7 000 FCFA/mois) quand tu grandis. Paiement par Wave ou Orange Money.',
};

type PlanFeature = string;
interface Plan {
  name: string;
  price: string;
  oldPrice?: string;
  period: string;
  tagline: string;
  features: PlanFeature[];
  cta: string;
  highlighted: boolean;
}

const PLANS: Plan[] = [
  {
    name: 'Gratuit',
    price: '0',
    period: 'pour toujours',
    tagline: 'Pour démarrer et tester Doolé sans aucun risque.',
    features: [
      'Boutique en ligne personnalisée',
      'Lien partageable (bio TikTok / Instagram)',
      "Jusqu'à 10 produits",
      'Paiement Wave / Orange Money direct',
      'Notification à chaque nouvelle commande',
      "Tableau de bord basique (aujourd'hui)",
      '3 zones de livraison',
      '30 commandes par mois',
      'Support : communauté WhatsApp',
    ],
    cta: 'Commencer gratuitement',
    highlighted: false,
  },
  {
    name: 'Starter',
    price: '3 000',
    oldPrice: '5 000',
    period: 'FCFA / mois',
    tagline: 'Quand tes ventes décollent et que tu veux tout automatiser.',
    features: [
      'Tout le plan Gratuit, plus :',
      "Jusqu'à 50 produits",
      'Dispatch livreur automatique (1 livreur)',
      'Suivi de commande par SMS pour la cliente',
      'Tableau de bord jour / semaine / mois',
      '10 zones de livraison',
      '200 commandes par mois',
      'Support WhatsApp prioritaire',
    ],
    cta: 'Choisir Starter',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '7 000',
    oldPrice: '10 000',
    period: 'FCFA / mois',
    tagline: 'Pour les boutiques établies avec du volume.',
    features: [
      'Tout le plan Starter, plus :',
      'Produits illimités',
      'Livreurs illimités',
      'Top produits (analyses de ventes)',
      'Zones de livraison illimitées',
      'Commandes illimitées',
      'Support WhatsApp prioritaire + appel',
    ],
    cta: 'Choisir Pro',
    highlighted: false,
  },
];

// Matrice de comparaison détaillée (valeurs : true = inclus, false = absent, ou texte).
interface ComparisonRow {
  label: string;
  gratuit: boolean | string;
  starter: boolean | string;
  pro: boolean | string;
}

const COMPARISON: ComparisonRow[] = [
  { label: 'Boutique en ligne personnalisée', gratuit: true, starter: true, pro: true },
  { label: 'Lien partageable (bio)', gratuit: true, starter: true, pro: true },
  { label: 'Nombre de produits', gratuit: '10 max', starter: '50 max', pro: 'Illimité' },
  { label: 'Paiement Wave / Orange Money direct', gratuit: true, starter: true, pro: true },
  { label: 'Notification nouvelle commande', gratuit: true, starter: true, pro: true },
  { label: 'Dispatch livreur automatique', gratuit: false, starter: '1 livreur', pro: 'Illimités' },
  { label: 'Suivi de commande par SMS (cliente)', gratuit: false, starter: true, pro: true },
  {
    label: "Tableau de bord chiffre d'affaires",
    gratuit: "Aujourd'hui",
    starter: 'Jour / Semaine / Mois',
    pro: '+ Top produits',
  },
  { label: 'Zones de livraison', gratuit: '3 max', starter: '10', pro: 'Illimité' },
  { label: 'Commandes par mois', gratuit: '30 max', starter: '200 max', pro: 'Illimité' },
  {
    label: 'Support',
    gratuit: 'Communauté WhatsApp',
    starter: 'WhatsApp prioritaire',
    pro: 'Prioritaire + appel',
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Y a-t-il un engagement ?',
    a: "Non. Tous les forfaits sont sans engagement, payables au mois et résiliables à tout moment.",
  },
  {
    q: 'Comment payer mon abonnement ?',
    a: 'Par Wave ou Orange Money, directement depuis ton téléphone. La carte bancaire est aussi acceptée en complément.',
  },
  {
    q: "Que se passe-t-il si j'atteins une limite de mon forfait ?",
    a: "On te prévient et tu peux passer à un forfait supérieur en un clic. L'accès aux nouvelles fonctionnalités est immédiat.",
  },
  {
    q: 'Le plan Gratuit est-il limité dans le temps ?',
    a: "Non. Le plan Gratuit s'utilise aussi longtemps que tu veux. C'est un vrai outil fonctionnel, pas une simple démo.",
  },
];

// Rendu d'une cellule du tableau comparatif.
function ComparisonCell({ value, highlighted }: { value: boolean | string; highlighted?: boolean }) {
  return (
    <td
      className={`px-4 py-3.5 text-center text-sm border-l-2 border-slate-200 ${
        highlighted ? 'bg-emerald-50' : ''
      }`}
    >
      {value === true ? (
        <Check className="h-5 w-5 text-emerald-600 mx-auto" />
      ) : value === false ? (
        <span className="text-slate-300 font-bold">—</span>
      ) : (
        <span className="font-bold text-slate-700">{value}</span>
      )}
    </td>
  );
}

export default function TarifsPage() {
  return (
    <div className="min-h-screen bg-[#FCFCFB] text-slate-900 font-sans antialiased">
      {/* ───────── Header ───────── */}
      <header className="sticky top-0 z-50 bg-[#FCFCFB] border-b-2 border-slate-900">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Retour à l'accueil">
            <DooleLogo />
          </Link>
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

      {/* ───────── Titre ───────── */}
      <section className="max-w-6xl mx-auto px-5 pt-14 pb-10 md:pt-20 md:pb-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
        <span className="block text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3">
          Tarifs
        </span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] max-w-2xl mx-auto">
          Des tarifs simples, sans surprise
        </h1>
        <p className="text-base md:text-lg text-slate-600 mt-4 max-w-xl mx-auto leading-relaxed">
          Commence gratuitement et passe à un forfait supérieur quand tes ventes grandissent.
          Sans engagement, résiliable à tout moment.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border-2 border-emerald-600 rounded-full px-3 py-1.5">
          <Check className="h-3.5 w-3.5" />
          Paiement par Wave ou Orange Money
        </div>
      </section>

      {/* ───────── Cartes forfaits ───────── */}
      <section className="max-w-6xl mx-auto px-5 pb-4">
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
                <h2 className="font-black text-xl">{plan.name}</h2>
                {plan.highlighted && (
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-1 rounded-full border-2 border-black">
                    Populaire
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{plan.tagline}</p>
              <div className="mt-5 flex items-end gap-1.5">
                {plan.oldPrice && (
                  <span className="text-sm text-slate-400 line-through mb-1">{plan.oldPrice}</span>
                )}
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-xs text-slate-500 mb-1.5">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-2.5 flex-1">
                {plan.features.map((f, idx) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2 text-sm ${
                      idx === 0 && f.endsWith(':')
                        ? 'font-bold text-slate-900'
                        : 'text-slate-700'
                    }`}
                  >
                    {!(idx === 0 && f.endsWith(':')) && (
                      <Check className="mt-0.5 h-4 w-4 text-emerald-600 shrink-0" />
                    )}
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/entrer"
                className={`mt-7 inline-flex items-center justify-center gap-2 h-12 px-6 font-bold text-sm rounded-xl border-2 border-black transition-all ${
                  plan.highlighted
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
                    : 'bg-white hover:bg-slate-50 text-slate-900'
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Tableau comparatif (desktop) ───────── */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-center mb-3">
          Comparer les forfaits en détail
        </h2>
        <p className="text-sm text-slate-500 text-center mb-10 md:hidden">
          Le détail complet de chaque forfait est listé dans les cartes ci-dessus.
        </p>

        <div className="hidden md:block overflow-hidden rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-4 py-4 text-left text-sm font-bold w-2/5">Fonctionnalité</th>
                <th className="px-4 py-4 text-center text-sm font-black border-l-2 border-slate-700">
                  Gratuit
                </th>
                <th className="px-4 py-4 text-center text-sm font-black border-l-2 border-slate-700 bg-emerald-600">
                  Starter
                </th>
                <th className="px-4 py-4 text-center text-sm font-black border-l-2 border-slate-700">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, idx) => (
                <tr
                  key={row.label}
                  className={`border-t-2 border-slate-200 ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}
                >
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-700">{row.label}</td>
                  <ComparisonCell value={row.gratuit} />
                  <ComparisonCell value={row.starter} highlighted />
                  <ComparisonCell value={row.pro} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="bg-white border-y-2 border-slate-900">
        <div className="max-w-3xl mx-auto px-5 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-center mb-10">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div
                key={item.q}
                className="border-2 border-slate-200 rounded-2xl p-5 hover:border-slate-900 transition-colors"
              >
                <h3 className="font-bold text-base mb-1.5">{item.q}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CTA final ───────── */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-24">
        <div className="bg-slate-900 text-white rounded-3xl border-2 border-black p-8 md:p-14 text-center shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]">
          <h2 className="text-2xl md:text-4xl font-black tracking-tight max-w-2xl mx-auto leading-tight">
            Commence gratuitement, dès aujourd&apos;hui
          </h2>
          <p className="text-slate-300 text-sm md:text-base mt-4 max-w-md mx-auto">
            Crée ta boutique en 3 minutes. Pas de carte bancaire, pas d&apos;engagement.
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
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/">
            <DooleLogo />
          </Link>
          <div className="flex items-center gap-6 text-sm font-bold text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Accueil
            </Link>
            <Link href="/entrer" className="hover:text-slate-900 transition-colors">
              Se connecter
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
