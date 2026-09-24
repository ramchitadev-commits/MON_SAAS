'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { DooleLogo } from '@/components/logos';
import { setAuthSession } from '@/lib/auth';
import { getShopSettings } from '@/lib/settings';
import { sendOtp, verifyOtp } from '@/lib/otp';

const OTP_LENGTH = 6;

export default function CodeOtpPage() {
  const router = useRouter();
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [phone, setPhone] = useState<string | null>(null);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Récupère le numéro saisi à l'écran précédent ; sinon retour connexion.
  useEffect(() => {
    const pending = sessionStorage.getItem('doole_pending_phone');
    if (!pending) {
      router.replace('/entrer');
      return;
    }
    setPhone(pending);
    inputsRef.current[0]?.focus();
  }, [router]);

  // Compte à rebours pour le renvoi du code.
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const focusInput = (index: number) => {
    inputsRef.current[index]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1); // dernier chiffre tapé
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (error) setError('');
    if (digit && index < OTP_LENGTH - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((d, i) => (next[i] = d));
    setDigits(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < OTP_LENGTH) {
      setError('Entrez les 6 chiffres du code reçu.');
      return;
    }

    if (!phone) return;

    setVerifying(true);
    try {
      await verifyOtp(phone, code);
      setAuthSession(phone);

      // Vérifie si une boutique existe déjà pour ce vendeur
      try {
        await getShopSettings();
        // Boutique existante → tableau de bord
        router.replace('/accueil');
      } catch {
        // Pas de boutique → onboarding
        router.replace('/onboarding');
      }
    } catch (err) {
      console.error('Erreur lors de la vérification:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la vérification. Veuillez réessayer.');
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !phone) return;
    setCountdown(30);
    setDigits(Array(OTP_LENGTH).fill(''));
    focusInput(0);
    try {
      await sendOtp(phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du renvoi du code.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFB] flex flex-col">
      <header className="p-5 flex items-center gap-3">
        <button
          onClick={() => router.push('/entrer')}
          aria-label="Retour"
          className="inline-flex items-center justify-center h-10 w-10 bg-white border-2 border-slate-900 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <DooleLogo />
      </header>

      <main className="flex-1 flex items-center justify-center px-5 pb-10">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Entrez le code
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Nous avons envoyé un code à 6 chiffres au{' '}
              <span className="font-bold text-slate-700">{phone ?? '…'}</span>.
            </p>
          </div>

          <form onSubmit={verify} className="space-y-5">
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputsRef.current[i] = el;
                  }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`h-14 w-12 text-center text-xl font-black bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                    error ? 'border-rose-500' : digit ? 'border-emerald-500' : 'border-slate-900'
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={verifying}
              className="h-14 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {verifying ? (
                'Vérification…'
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Vérifier et continuer
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm">
            {countdown > 0 ? (
              <span className="text-slate-400">
                Renvoyer le code dans <span className="font-bold text-slate-600">{countdown}s</span>
              </span>
            ) : (
              <button
                onClick={handleResend}
                className="font-bold text-emerald-600 hover:underline cursor-pointer"
              >
                Renvoyer le code
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
