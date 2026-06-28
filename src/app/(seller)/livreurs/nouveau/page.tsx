'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Check } from 'lucide-react';
import { createCourier } from '@/lib/couriers';
import { CourierChannel } from '@/types';

export default function NouveauLivreurPage() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<CourierChannel>('whatsapp');
  const [isDefault, setIsDefault] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Le nom est obligatoire';
    if (!phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est obligatoire';
    } else if (phone.replace(/[\s+]/g, '').length < 9) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // La logique « premier livreur = par défaut » et le retrait du défaut
    // des autres livreurs sont gérés dans createCourier().
    try {
      await createCourier({
        name,
        phone: `+221 ${phone}`,
        channel,
        isDefault,
      });
      router.push('/livreurs');
    } catch (err) {
      console.error(err);
      alert('Enregistrement impossible. Vérifiez votre connexion et réessayez.');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/livreurs"
          className="inline-flex items-center justify-center p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">
          Nouveau Livreur
        </h1>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-4">
          {/* Nom complet */}
          <div className="space-y-1.5">
            <label htmlFor="courier-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Nom complet
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                id="courier-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Modou Diop"
                className={`w-full h-12 pl-10 pr-4 bg-white border-2 border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.name ? 'border-rose-500' : ''
                }`}
              />
            </div>
            {errors.name && <p className="text-xs font-bold text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Téléphone */}
          <div className="space-y-1.5">
            <label htmlFor="courier-phone" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Numéro de téléphone
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 font-bold text-slate-400 text-sm select-none border-r-2 border-slate-900 pr-3.5 my-3 h-6">
                +221
              </span>
              <input
                id="courier-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="77 123 45 67"
                className={`w-full h-12 pl-[85px] pr-4 bg-white border-2 border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.phone ? 'border-rose-500' : ''
                }`}
              />
            </div>
            {errors.phone && <p className="text-xs font-bold text-rose-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Canal de notification */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Canal d'expédition automatique
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`h-12 border-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  channel === 'whatsapp'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-900 hover:bg-slate-50'
                }`}
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setChannel('sms')}
                className={`h-12 border-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  channel === 'sms'
                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-slate-900 hover:bg-slate-50'
                }`}
              >
                SMS
              </button>
            </div>
          </div>

          {/* Définir par défaut */}
          <div className="pt-3 flex items-center gap-3">
            <input
              id="default-courier"
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-5 w-5 rounded border-2 border-slate-900 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
            />
            <label htmlFor="default-courier" className="text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer">
              Définir comme livreur par défaut
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="h-12 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Check className="h-4 w-4" />
          Enregistrer le Livreur
        </button>
      </form>
    </div>
  );
}
