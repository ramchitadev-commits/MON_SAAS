'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, CheckCircle } from 'lucide-react';
import { getShopSettings, saveShopSettings, ShopSettings } from '@/lib/settings';

export default function BoutiqueSettingsPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [payoutPhone, setPayoutPhone] = useState('');
  const [payoutProvider, setPayoutProvider] = useState<'wave' | 'orange_money'>('wave');
  const [deliveryFee, setDeliveryFee] = useState(1500);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getShopSettings()
      .then((settings) => {
        if (!active) return;
        setName(settings.name);
        setDescription(settings.description);
        setPayoutPhone(settings.payoutPhone.replace('+221 ', ''));
        setPayoutProvider(settings.payoutProvider);
        setDeliveryFee(settings.deliveryFee);
      })
      .catch((err) => console.error(err));
    return () => {
      active = false;
    };
  }, []);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Le nom de la boutique est obligatoire';
    if (!description.trim()) newErrors.description = 'La description est obligatoire';
    if (!payoutPhone.trim()) {
      newErrors.phone = 'Le numéro de réception est obligatoire';
    } else if (payoutPhone.replace(/[\s+]/g, '').length < 9) {
      newErrors.phone = 'Numéro de réception invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const updatedSettings: ShopSettings = {
      name,
      description,
      payoutPhone: payoutPhone.startsWith('+221') ? payoutPhone : `+221 ${payoutPhone}`,
      payoutProvider,
      deliveryFee,
    };

    try {
      await saveShopSettings(updatedSettings);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push('/accueil');
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Enregistrement impossible. Vérifiez votre connexion et réessayez.');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl flex items-center gap-2">
          <Settings className="h-7 w-7 text-emerald-600" />
          Paramètres de ma Boutique
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configurez l'identité visuelle et les détails de paiement de votre boutique en ligne.
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSave} className="space-y-6">
        {success && (
          <div className="bg-emerald-100 border-2 border-emerald-500 text-emerald-950 p-4 rounded-xl flex items-center gap-3 font-bold text-sm">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            Paramètres enregistrés avec succès !
          </div>
        )}

        <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Identité Publique
          </h3>

          {/* Nom de boutique */}
          <div className="space-y-1.5">
            <label htmlFor="shop-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Nom de la boutique
            </label>
            <input
              id="shop-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Fatou Collection"
              className={`w-full h-12 px-4 bg-white border-2 border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${errors.name ? 'border-rose-500' : ''
                }`}
            />
            {errors.name && <p className="text-xs font-bold text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="shop-desc" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Description / Bio de la boutique
            </label>
            <textarea
              id="shop-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Robes Wax de haute qualité importées de Turquie..."
              rows={4}
              className={`w-full p-4 bg-white border-2 border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none ${errors.description ? 'border-rose-500' : ''
                }`}
            />
            {errors.description && <p className="text-xs font-bold text-rose-500 mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Coordonnées financières */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Réception des Paiements
          </h3>

          <p className="text-xs text-slate-500 leading-relaxed">
            Saisissez le numéro de téléphone sur lequel vos clients vous enverront l'argent directement (Wave ou Orange Money).
          </p>

          {/* Choix opérateur */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Opérateur par défaut
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayoutProvider('wave')}
                className={`h-12 border-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${payoutProvider === 'wave'
                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-slate-900 hover:bg-slate-50'
                  }`}
              >
                Wave
              </button>
              <button
                type="button"
                onClick={() => setPayoutProvider('orange_money')}
                className={`h-12 border-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${payoutProvider === 'orange_money'
                    ? 'border-orange-600 bg-orange-50 text-orange-800'
                    : 'border-slate-900 hover:bg-slate-50'
                  }`}
              >
                Orange Money
              </button>
            </div>
          </div>

          {/* Numéro Réception */}
          <div className="space-y-1.5">
            <label htmlFor="payout-phone" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Numéro de téléphone de réception
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 font-bold text-slate-400 text-sm select-none border-r-2 border-slate-900 pr-3.5 my-3 h-6">
                +221
              </span>
              <input
                id="payout-phone"
                type="tel"
                value={payoutPhone}
                onChange={(e) => setPayoutPhone(e.target.value)}
                placeholder="77 123 45 67"
                className={`w-full h-12 pl-[85px] pr-4 bg-white border-2 border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${errors.phone ? 'border-rose-500' : ''
                  }`}
              />
            </div>
            {errors.phone && <p className="text-xs font-bold text-rose-500 mt-1">{errors.phone}</p>}
          </div>
        </div>

        <button
          type="submit"
          className="h-12 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4" />
          Enregistrer les paramètres
        </button>
      </form>
    </div>
  );
}
