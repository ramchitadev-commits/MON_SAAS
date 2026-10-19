'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Store,
  Wallet,
  PartyPopper,
  Copy,
  Check,
} from 'lucide-react';
import { DooleLogo } from '@/components/logos';
import { getShopSettings, saveShopSettings } from '@/lib/settings';
import { ShopSettings } from '@/types';

// Transforme un nom de boutique en slug d'URL (sans accents ni caractères spéciaux).
const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les accents (diacritiques combinants)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30) || 'ma-boutique';

export default function OnboardingPage() {
  const router = useRouter();

  // 1 → 2 → 3 (écran "prête")
  const [step, setStep] = useState(1);

  // Étape 1 — boutique
  const [shopName, setShopName] = useState('');

  // Étape 2 — paiement
  const [payoutProvider, setPayoutProvider] = useState<'wave' | 'orange_money'>('wave');
  const [payoutPhone, setPayoutPhone] = useState('');

  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const slug = slugify(shopName);
  const shopUrl = `${slug}`;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPayoutPhone(e.target.value.replace(/\D/g, '').slice(0, 9));
    if (error) setError('');
  };

  const formattedPhone = payoutPhone.replace(/(\d{2})(\d{3})?(\d{2})?(\d{2})?/, (_m, a, b, c, d) =>
    [a, b, c, d].filter(Boolean).join(' ')
  );


  // Sauvegarde la boutique + le produit éventuel, puis marque l'onboarding terminé.
  const finalize = async () => {
    try {
      // 1. Récupérer la base d'abord
      let base: Partial<ShopSettings> = {};
      try {
        base = await getShopSettings();
      } catch (e) {
        console.warn('Impossible de charger les réglages de base, utilisation des valeurs par défaut', e);
      }

      // 2. Préparer des données COMPLÈTES valides pour la validation Zod
      const settingsToSave = {
        ...base,
        slug: slug, // Inclure le slug pour retrouver la boutique en storefront
        name: shopName.trim(),
        description: `Bienvenue dans ${shopName.trim()} ! Commandez en quelques clics, payez par mobile money et soyez livré.`,
        payoutPhone: payoutPhone.trim() || '', // 9 chiffres sans préfixe superflu
        payoutProvider,
        deliveryFee: base.deliveryFee ?? 1500, // Sécurité : impose 1500 FCFA par défaut si absent
        sellerName: base.sellerName || 'Partenaire',
      };

      // 3. Sauvegarder la boutique dans Supabase
      const saved = await saveShopSettings(settingsToSave as ShopSettings);

    } catch (err: unknown) {
      console.error('Erreur complète finalize:', err);
      if (err instanceof Error) {
        console.error('Stack trace:', err.stack);
      }
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue lors de la finalisation';
      throw new Error(`Erreur onboarding: ${errorMessage}`);
    }
  };

  const goNext = async () => {
    setError('');
    if (step === 1) {
      if (!shopName.trim()) {
        setError('Donnez un nom à votre boutique.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (payoutPhone.length < 9) {
        setError('Entrez un numéro de réception valide (9 chiffres).');
        return;
      }
      setIsLoading(true);
      try {
        await finalize();
        setStep(3);
      } catch (err: unknown) {
        console.error('Finalisation échouée :', err);
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la finalisation. Réessayez.';
        setError(errorMessage);
        setIsLoading(false);
      }
    }
  };

  const goBack = () => {
    setError('');
    if (step > 1 && step < 4) setStep(step - 1);
    else router.push('/entrer');
  };

  const copyLink = () => {
    const fullUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/${shopUrl}`
      : `https://doole.sn/${shopUrl}`;
    navigator.clipboard?.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // -------- Écran final "boutique prête" --------
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#FCFCFB] flex flex-col">
        <header className="p-5 flex justify-center md:justify-start">
          <DooleLogo />
        </header>
        <main className="flex-1 flex items-center justify-center px-5 pb-10">
          <div className="w-full max-w-sm space-y-7 text-center">
            <div className="flex justify-center">
              <div className="flex items-center justify-center h-20 w-20 bg-emerald-100 border-2 border-emerald-500 rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <PartyPopper className="h-9 w-9 text-emerald-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Votre boutique est prête !
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Partagez ce lien dans votre bio TikTok ou Instagram. Vos clientes pourront
                commander et payer directement.
              </p>
            </div>

            {/* Lien partageable */}
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">
                Lien de votre boutique
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-left text-sm font-bold text-emerald-700 truncate">
                  {shopUrl}
                </code>
                <button
                  onClick={copyLink}
                  className={`shrink-0 inline-flex items-center gap-1.5 h-10 px-3 border-2 border-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer ${copied
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" /> Copié
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copier
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => router.replace('/accueil')}
              className="h-14 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Aller à mon tableau de bord
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </main>
      </div>
    );
  }

  // -------- Étapes 1 à 3 --------
  return (
    <div className="min-h-screen bg-[#FCFCFB] flex flex-col">
      <header className="p-5 flex items-center gap-3">
        <button
          onClick={goBack}
          aria-label="Retour"
          className="inline-flex items-center justify-center h-10 w-10 bg-white border-2 border-slate-900 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <DooleLogo />
      </header>

      <main className="flex-1 flex flex-col px-5 pb-10 max-w-sm w-full mx-auto">
        {/* Barre de progression 2 étapes */}
        <div className="flex items-center gap-2 mt-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${s <= step ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
            />
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          {/* ÉTAPE 1 — Nom de boutique */}
          {step === 1 && (
            <div className="space-y-6">
              <StepHeader
                icon={<Store className="h-6 w-6 text-emerald-600" />}
                badge="Étape 1 / 2"
                title="Nommez votre boutique"
                subtitle="C'est le nom que vos clientes verront en haut de votre page."
              />
              <div className="space-y-1.5">
                <label htmlFor="shop" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Nom de la boutique
                </label>
                <input
                  id="shop"
                  type="text"
                  autoFocus
                  value={shopName}
                  onChange={(e) => {
                    setShopName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Ex : Fatou Collection"
                  className={`w-full h-14 px-4 bg-white border-2 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${error ? 'border-rose-500' : 'border-slate-900'
                    }`}
                />
                {shopName.trim() && (
                  <p className="text-xs text-slate-400 pt-1">
                    Votre lien :{' '}
                    <span className="font-bold text-emerald-600">{shopUrl}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ÉTAPE 2 — Paiement */}
          {step === 2 && (
            <div className="space-y-6">
              <StepHeader
                icon={<Wallet className="h-6 w-6 text-emerald-600" />}
                badge="Étape 2 / 2"
                title="Où recevez-vous l'argent ?"
                subtitle="Le paiement de vos clientes arrive directement sur ce numéro. Doolé ne touche jamais l'argent."
              />
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Opérateur
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayoutProvider('wave')}
                    className={`h-12 border-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${payoutProvider === 'wave'
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    Wave
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutProvider('orange_money')}
                    className={`h-12 border-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${payoutProvider === 'orange_money'
                      ? 'border-orange-600 bg-orange-50 text-orange-800'
                      : 'border-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    Orange Money
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="payout" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Numéro de réception
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 pr-3.5 my-3 h-6 font-bold text-slate-400 text-sm select-none border-r-2 border-slate-900">
                    +221
                  </span>
                  <input
                    id="payout"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={formattedPhone}
                    onChange={handlePhoneChange}
                    placeholder="77 123 45 67"
                    className={`w-full h-14 pl-[85px] pr-4 bg-white border-2 rounded-xl text-base font-medium tracking-wide text-slate-900 placeholder:text-slate-400 caret-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${error ? 'border-rose-500' : 'border-slate-900'
                      }`}
                  />
                </div>
              </div>
            </div>
          )}


          {error && (
            <p className="text-xs font-bold text-rose-500 mt-4">{error}</p>
          )}

          {/* Actions */}
          <div className="mt-auto pt-8 space-y-3">
            <button
              onClick={goNext}
              disabled={isLoading}
              className="h-14 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? 'Traitement...' : 'Continuer'}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepHeader({
  icon,
  badge,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center h-14 w-14 bg-emerald-100 border-2 border-emerald-500 rounded-xl">
        {icon}
      </div>
      <div className="space-y-1">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
          {badge}
        </span>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}