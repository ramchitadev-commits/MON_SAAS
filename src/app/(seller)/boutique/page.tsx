'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, CheckCircle, Upload, Clock } from 'lucide-react';
import { getShopSettings, saveShopSettings, uploadLogo, ShopSettings } from '@/lib/settings';

export default function BoutiqueSettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [payoutPhone, setPayoutPhone] = useState('');
  const [payoutProvider, setPayoutProvider] = useState<'wave' | 'orange_money'>('wave');
  const [deliveryFee, setDeliveryFee] = useState(1500);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [cutoffTime, setCutoffTime] = useState('18:00');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

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
        if (settings.logo) {
          setLogoPreview(settings.logo);
        }
        if (settings.cutoffTime) {
          setCutoffTime(settings.cutoffTime);
        }
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
    if (!cutoffTime.match(/^\d{2}:\d{2}$/)) {
      newErrors.cutoff = 'Format invalide (HH:MM)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Image trop lourde (max 2 Mo).');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setLogoPreview(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      let logoUrl = logoPreview;

      // Si un nouveau fichier a été choisi, l'uploader
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }

      const updatedSettings: ShopSettings = {
        name,
        description,
        payoutPhone: payoutPhone.startsWith('+221') ? payoutPhone : `+221 ${payoutPhone}`,
        payoutProvider,
        deliveryFee,
        logo: logoUrl || null,
        cutoffTime,
      };

      await saveShopSettings(updatedSettings);
      setLogoFile(null); // Réinitialise le fichier après upload
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push('/accueil');
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Enregistrement impossible. Vérifiez votre connexion et réessayez.');
    } finally {
      setIsSaving(false);
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
              className={`w-full h-12 px-4 bg-white border-2 border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                errors.name ? 'border-rose-500' : ''
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
              className={`w-full p-4 bg-white border-2 border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none ${
                errors.description ? 'border-rose-500' : ''
              }`}
            />
            {errors.description && <p className="text-xs font-bold text-rose-500 mt-1">{errors.description}</p>}
          </div>

          {/* Logo Upload */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Photo de profil / Logo
            </label>
            <div className="flex items-center gap-4">
              <div
                className="flex-1 border-2 border-dashed border-slate-400 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  id="shop-logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Choisir une image</p>
                    <p className="text-xs text-slate-500">PNG, JPG · Max 2 Mo</p>
                  </div>
                </div>
              </div>

              {logoPreview && (
                <div className="flex-shrink-0">
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-20 w-20 rounded-full border-2 border-slate-900 object-cover shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Horaires & Paiement */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Horaires & Paiement
          </h3>

          {/* Heure de descente */}
          <div className="space-y-1.5">
            <label htmlFor="cutoff-time" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 block">
              <Clock className="h-4 w-4" />
              Heure de descente (cutoff)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Les commandes après cette heure seront livrées le lendemain.
            </p>
            <input
              id="cutoff-time"
              type="time"
              value={cutoffTime}
              onChange={(e) => setCutoffTime(e.target.value)}
              className={`w-full h-12 px-4 bg-white border-2 border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                errors.cutoff ? 'border-rose-500' : ''
              }`}
            />
            {errors.cutoff && <p className="text-xs font-bold text-rose-500 mt-1">{errors.cutoff}</p>}
          </div>

          <hr className="border-t-2 border-slate-200" />

          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">
            Réception des Paiements
          </h3>

          <p className="text-xs text-slate-500 leading-relaxed">
            Saisissez le numéro de téléphone sur lequel vos clients vous enverront l'argent directement.
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
                className={`h-12 border-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
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
                className={`h-12 border-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  payoutProvider === 'orange_money'
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
                className={`w-full h-12 pl-[85px] pr-4 bg-white border-2 border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.phone ? 'border-rose-500' : ''
                }`}
              />
            </div>
            {errors.phone && <p className="text-xs font-bold text-rose-500 mt-1">{errors.phone}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="h-12 w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold px-6 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </button>
      </form>
    </div>
  );
}
