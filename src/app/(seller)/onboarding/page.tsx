'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Store,
  Wallet,
  Camera,
  Upload,
  X,
  PartyPopper,
  Copy,
  Check,
  SkipForward,
} from 'lucide-react';
import { DooleLogo } from '@/components/logos';
import { setOnboarded } from '@/lib/mockData';
import { getShopSettings, saveShopSettings } from '@/lib/settings';
import { createProduct } from '@/lib/products';

// Transforme un nom de boutique en slug d'URL (sans accents ni caractères spéciaux).
const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // retire les accents (diacritiques combinants)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30) || 'ma-boutique';

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1 → 2 → 3 → 4 (écran "prête")
  const [step, setStep] = useState(1);

  // Étape 1 — boutique
  const [shopName, setShopName] = useState('');

  // Étape 2 — paiement
  const [payoutProvider, setPayoutProvider] = useState<'wave' | 'orange_money'>('wave');
  const [payoutPhone, setPayoutPhone] = useState('');

  // Étape 3 — premier produit (facultatif)
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const slug = slugify(shopName);
  const shopUrl = `doole.sn/${slug}`;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPayoutPhone(e.target.value.replace(/\D/g, '').slice(0, 9));
    if (error) setError('');
  };

  const handleImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("L'image est trop lourde (max 5 Mo).");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setProductImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Sauvegarde la boutique + le produit éventuel, puis marque l'onboarding terminé.
  const finalize = async () => {
    const base = await getShopSettings();
    await saveShopSettings({
      ...base,
      name: shopName.trim(),
      description: `Bienvenue dans ${shopName.trim()} ! Commandez en quelques clics, payez par mobile money et soyez livré.`,
      payoutPhone: `+221 ${payoutPhone}`,
      payoutProvider,
    });

    const price = parseInt(productPrice);
    if (productName.trim() && !isNaN(price) && price >= 0) {
      try {
        await createProduct({
          name: productName.trim(),
          description: '',
          price,
          image: productImage || '',
          isAvailable: true,
          stock: null,
        });
      } catch (err) {
        // Le premier produit est facultatif : on n'interrompt pas l'onboarding s'il échoue.
        console.error('Création du premier produit échouée :', err);
      }
    }

    setOnboarded(true);
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
      setStep(3);
    } else if (step === 3) {
      if (productName.trim() && (!productPrice || parseInt(productPrice) < 0)) {
        setError('Entrez un prix valide pour ce produit, ou laissez le nom vide pour passer.');
        return;
      }
      try {
        await finalize();
      } catch (err) {
        console.error('Finalisation échouée :', err);
      }
      setStep(4);
    }
  };

  const skipProduct = async () => {
    setProductName('');
    setProductPrice('');
    setProductImage(null);
    try {
      await finalize();
    } catch (err) {
      console.error('Finalisation échouée :', err);
    }
    setStep(4);
  };

  const goBack = () => {
    setError('');
    if (step > 1 && step < 4) setStep(step - 1);
    else router.push('/entrer');
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(`https://${shopUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // -------- Écran final "boutique prête" --------
  if (step === 4) {
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
                  className={`shrink-0 inline-flex items-center gap-1.5 h-10 px-3 border-2 border-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    copied
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
        {/* Barre de progression 3 étapes */}
        <div className="flex items-center gap-2 mt-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-emerald-500' : 'bg-slate-200'
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
                badge="Étape 1 / 3"
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
                  className={`w-full h-14 px-4 bg-white border-2 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                    error ? 'border-rose-500' : 'border-slate-900'
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
                badge="Étape 2 / 3"
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
                    className={`h-12 border-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      payoutProvider === 'wave'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Wave
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutProvider('orange_money')}
                    className={`h-12 border-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      payoutProvider === 'orange_money'
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
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 pr-3.5 my-3 h-6 font-bold text-slate-400 text-sm select-none border-r-2 border-slate-900">
                    +221
                  </span>
                  <input
                    id="payout"
                    type="tel"
                    inputMode="numeric"
                    value={payoutPhone}
                    onChange={handlePhoneChange}
                    placeholder="77 123 45 67"
                    className={`w-full h-14 pl-[85px] pr-4 bg-white border-2 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      error ? 'border-rose-500' : 'border-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 — Premier produit (facultatif) */}
          {step === 3 && (
            <div className="space-y-6">
              <StepHeader
                icon={<Camera className="h-6 w-6 text-emerald-600" />}
                badge="Étape 3 / 3"
                title="Ajoutez un premier produit"
                subtitle="Facultatif — vous pourrez en ajouter d'autres plus tard depuis votre tableau de bord."
              />

              {/* Photo */}
              {productImage ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-emerald-500">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={productImage} alt="Aperçu" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setProductImage(null)}
                    aria-label="Retirer la photo"
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all cursor-pointer"
                >
                  <Upload className="h-6 w-6 text-slate-400" />
                  <span className="text-sm font-bold text-slate-600">Choisir une photo</span>
                  <span className="text-[11px] text-slate-400">JPG, PNG · Max 5 Mo</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImage(f);
                }}
              />

              <div className="space-y-1.5">
                <label htmlFor="pname" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Nom de l&apos;article
                </label>
                <input
                  id="pname"
                  type="text"
                  value={productName}
                  onChange={(e) => {
                    setProductName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Ex : Robe Wax Fama"
                  className="w-full h-14 px-4 bg-white border-2 border-slate-900 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="pprice" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Prix
                </label>
                <div className="relative">
                  <input
                    id="pprice"
                    type="number"
                    min="0"
                    value={productPrice}
                    onChange={(e) => {
                      setProductPrice(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="15000"
                    className={`w-full h-14 pl-4 pr-16 bg-white border-2 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      error ? 'border-rose-500' : 'border-slate-900'
                    }`}
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-bold text-slate-400 pointer-events-none">
                    FCFA
                  </span>
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
              className="h-14 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {step === 3 ? 'Terminer' : 'Continuer'}
              <ArrowRight className="h-4 w-4" />
            </button>

            {step === 3 && (
              <button
                onClick={skipProduct}
                className="h-12 w-full text-slate-500 hover:text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <SkipForward className="h-4 w-4" />
                Passer cette étape
              </button>
            )}
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
