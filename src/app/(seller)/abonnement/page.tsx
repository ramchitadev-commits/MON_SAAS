'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, ArrowRight } from 'lucide-react';
import type { Plan } from '@/types';
import { fetchCurrentPlan } from './actions';

const PLANS = [
  {
    key: 'free' as Plan,
    name: 'Gratuit',
    price: '0 FCFA',
    period: 'Pour toujours',
    description: 'Commencez votre boutique',
  },
  {
    key: 'starter' as Plan,
    name: 'Starter',
    price: '3 000 FCFA',
    period: 'Par mois',
    description: 'Pour les vendeurs qui grandissent',
    highlight: true,
  },
  {
    key: 'pro' as Plan,
    name: 'Pro',
    price: '7 000 FCFA',
    period: 'Par mois',
    description: 'Pour les vendeurs à plein régime',
  },
];

interface Feature {
  key: string;
  label: string;
  free: string | boolean;
  starter: string | boolean;
  pro: string | boolean;
}

const FEATURES: Feature[] = [
  {
    key: 'boutique',
    label: 'Boutique en ligne personnalisée',
    free: true,
    starter: true,
    pro: true,
  },
  {
    key: 'produits',
    label: 'Nombre de produits',
    free: '10 max',
    starter: '50 max',
    pro: 'Illimité',
  },
  {
    key: 'commandes',
    label: 'Commandes par mois',
    free: '30 max',
    starter: '200 max',
    pro: 'Illimité',
  },
  {
    key: 'dispatch',
    label: 'Dispatch automatique livreur',
    free: false,
    starter: true,
    pro: true,
  },
  {
    key: 'couriers',
    label: 'Nombre de livreurs',
    free: '0',
    starter: '1',
    pro: 'Illimité',
  },
  {
    key: 'sms_acheteur',
    label: 'SMS confirmation acheteur',
    free: false,
    starter: true,
    pro: true,
  },
  {
    key: 'dashboard',
    label: 'Tableau de bord CA',
    free: 'Basique',
    starter: 'Avancé',
    pro: 'Avancé +',
  },
  {
    key: 'support',
    label: 'Support',
    free: 'Communauté',
    starter: 'WhatsApp',
    pro: 'WhatsApp prioritaire',
  },
];

export default function AbonnementPage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const plan = await fetchCurrentPlan();
        setCurrentPlan(plan);
      } catch (err) {
        console.error('Erreur lors du chargement du plan:', err);
        router.push('/entrer');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FCFCFB]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 z-30 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg font-black text-slate-900">Mon abonnement</h1>
          <p className="text-xs text-slate-500 mt-1">
            Plan actuel: <span className="font-bold text-emerald-600">{currentPlan?.toUpperCase()}</span>
          </p>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* Plans actuels */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Choisir un plan</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`relative border-2 rounded-2xl p-6 transition-all ${
                  plan.highlight
                    ? 'border-emerald-600 bg-emerald-50 shadow-[3px_3px_0px_0px_rgba(0,135,90,0.3)]'
                    : 'border-slate-200 bg-white shadow-xs'
                } ${currentPlan === plan.key ? 'ring-2 ring-emerald-600' : ''}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-6 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                    Recommandé
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                  </div>

                  <div>
                    <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-xs text-slate-500 ml-2">/{plan.period}</span>
                  </div>

                  {currentPlan === plan.key ? (
                    <div className="h-12 flex items-center justify-center bg-slate-900 text-white font-bold text-sm rounded-lg border-2 border-black">
                      ✓ Plan actuel
                    </div>
                  ) : (
                    <a
                      href={`https://wa.me/+221771234567?text=Je veux passer au plan ${plan.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-12 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                    >
                      Passer à ce plan <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tableau comparatif */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Comparaison des fonctionnalités</h2>

          <div className="overflow-x-auto border-2 border-slate-200 rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-100">
                  <th className="p-4 text-left font-bold text-slate-900">Fonctionnalité</th>
                  <th className="p-4 text-center font-bold text-slate-900">Gratuit</th>
                  <th className="p-4 text-center font-bold text-emerald-600 bg-emerald-50">Starter</th>
                  <th className="p-4 text-center font-bold text-slate-900">Pro</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, idx) => (
                  <tr key={feature.key} className={`border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <td className="p-4 text-slate-900 font-medium">{feature.label}</td>
                    <td className="p-4 text-center">{renderFeatureValue(feature.free)}</td>
                    <td className="p-4 text-center bg-emerald-50">{renderFeatureValue(feature.starter)}</td>
                    <td className="p-4 text-center">{renderFeatureValue(feature.pro)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 text-center space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-lg font-bold text-slate-900">Des questions ?</h3>
          <p className="text-sm text-slate-600">
            Contactez-nous sur WhatsApp ou par email pour plus d'informations sur les plans.
          </p>
          <a
            href="https://wa.me/+221771234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            Nous contacter sur WhatsApp →
          </a>
        </div>
      </main>
    </div>
  );
}

function renderFeatureValue(value: string | boolean): React.ReactNode {
  if (value === true) {
    return <Check className="h-5 w-5 text-emerald-600 mx-auto" />;
  }
  if (value === false) {
    return <X className="h-5 w-5 text-rose-500 mx-auto" />;
  }
  return <span className="text-slate-600 font-medium">{value}</span>;
}
