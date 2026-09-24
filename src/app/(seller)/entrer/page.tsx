'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { DooleLogo } from '@/components/logos';
import { sendOtp } from '@/lib/otp';

export default function EntrerPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Ne garde que les chiffres et limite à 9 (format sénégalais : 77 123 45 67).
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPhone(digits);
    if (error) setError('');
  };

  // Affiche le numéro groupé "77 123 45 67" pour la lisibilité.
  const formatted = phone.replace(/(\d{2})(\d{3})?(\d{2})?(\d{2})?/, (_m, a, b, c, d) =>
    [a, b, c, d].filter(Boolean).join(' ')
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 9) {
      setError('Entrez un numéro de téléphone valide (9 chiffres).');
      return;
    }

    setLoading(true);
    const fullPhone = `+221${phone}`;
    try {
      await sendOtp(fullPhone);
      sessionStorage.setItem('doole_pending_phone', fullPhone);
      router.push('/entrer/code');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi du code.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFB] flex flex-col">
      {/* En-tête simple */}
      <header className="p-5 flex justify-center md:justify-start">
        <DooleLogo />
      </header>

      {/* Contenu centré */}
      <main className="flex-1 flex items-center justify-center px-5 pb-10">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Bienvenue 👋
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Connectez-vous avec votre numéro de téléphone pour gérer votre boutique.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="phone"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
              >
                Numéro de téléphone
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pr-3.5 my-3 h-6 font-bold text-slate-400 text-sm select-none border-r-2 border-slate-900">
                  +221
                </span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  autoFocus
                  value={formatted}
                  onChange={handlePhoneChange}
                  placeholder="77 123 45 67"
                  className={`w-full h-14 pl-[85px] pr-4 bg-white border-2 rounded-xl text-base font-medium tracking-wide focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                    error ? 'border-rose-500' : 'border-slate-900'
                  }`}
                />
              </div>
              {error && <p className="text-xs font-bold text-rose-500 mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Phone className="h-4 w-4 animate-pulse" />
                  Envoi du code…
                </>
              ) : (
                <>
                  Recevoir le code
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed bg-white border border-slate-200 rounded-xl p-3.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              Un code de vérification à 6 chiffres vous sera envoyé par SMS. Aucun mot de
              passe à retenir.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
