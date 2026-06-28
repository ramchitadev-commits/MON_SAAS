'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, User, FileText } from 'lucide-react';
import { getCart, getCartTotal, CartItem } from '@/lib/cart';

interface Zone {
  name: string;
  fee: number;
}

const DAKAR_ZONES: Zone[] = [
  { name: 'Mermoz', fee: 1500 },
  { name: 'Plateau', fee: 1500 },
  { name: 'Amitié / Fann / Point E', fee: 1500 },
  { name: 'Almadies', fee: 2000 },
  { name: 'Ouakam / Mamelles', fee: 1500 },
  { name: 'Yoff / Ngor', fee: 2000 },
  { name: 'Parcelles Assainies', fee: 2000 },
  { name: 'Guédiawaye', fee: 2500 },
  { name: 'Pikine', fee: 2500 },
  { name: 'Rufisque', fee: 3500 },
];

export default function DeliveryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const items = getCart(slug);
    if (items.length === 0) {
      router.push(`/${slug}`);
      return;
    }
    setCartItems(items);

    // Pré-remplit si déjà saisi
    const saved = sessionStorage.getItem(`doole_delivery_${slug}`);
    if (saved) {
      const data = JSON.parse(saved);
      setName(data.name || '');
      setPhone(data.phone || '');
      setSelectedZone(data.zone || '');
      setAddress(data.address || '');
      setNote(data.note || '');
    }
  }, [slug, router]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Le nom est obligatoire';
    
    // Validation du numéro de téléphone sénégalais simple (70, 75, 76, 77, 78, 33...)
    const phoneTrimmed = phone.replace(/[\s+]/g, '');
    if (!phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est obligatoire';
    } else if (phoneTrimmed.length < 9) {
      newErrors.phone = 'Numéro de téléphone invalide (min 9 chiffres)';
    }

    if (!selectedZone) newErrors.zone = 'Veuillez sélectionner une zone de livraison';
    if (!address.trim()) newErrors.address = 'L\'adresse de livraison exacte est obligatoire';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const zoneInfo = DAKAR_ZONES.find((z) => z.name === selectedZone);
    const fee = zoneInfo ? zoneInfo.fee : 0;

    const deliveryInfo = { name, phone, zone: selectedZone, fee, address, note };
    sessionStorage.setItem(`doole_delivery_${slug}`, JSON.stringify(deliveryInfo));

    router.push(`/${slug}/paiement`);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const cartSubtotal = getCartTotal(cartItems);
  const selectedZoneFee = DAKAR_ZONES.find((z) => z.name === selectedZone)?.fee || 0;
  const totalAmount = cartSubtotal + selectedZoneFee;

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 z-30 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href={`/${slug}/panier`}
            className="inline-flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 text-slate-700 transition-colors cursor-pointer h-11 w-11"
            title="Retour au panier"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-emerald-600" /> Livraison
          </span>
          <div className="w-11"></div>
        </div>
      </header>

      {/* Formulaire */}
      <main className="max-w-xl mx-auto px-4 py-6">
        <form onSubmit={handleNext} className="space-y-6">
          {/* Fiche coordonnées style flat */}
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4" /> Vos Coordonnées
            </h3>

            {/* Nom */}
            <div className="space-y-1.5">
              <label htmlFor="customer-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Nom complet
              </label>
              <input
                id="customer-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Fatou Diop"
                className={`w-full h-12 px-4 bg-white border-2 border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-all ${
                  errors.name ? 'border-rose-500 ring-1 ring-rose-500' : ''
                }`}
              />
              {errors.name && <p className="text-xs font-bold text-rose-500 mt-1">{errors.name}</p>}
            </div>

            {/* Téléphone */}
            <div className="space-y-1.5">
              <label htmlFor="customer-phone" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Téléphone (Wave / OM)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 font-bold text-slate-400 text-sm select-none border-r-2 border-slate-900 pr-3.5 my-3 h-6">
                  +221
                </span>
                <input
                  id="customer-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="77 123 45 67"
                  className={`w-full h-12 pl-[85px] pr-4 bg-white border-2 border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-all ${
                    errors.phone ? 'border-rose-500 ring-1 ring-rose-500' : ''
                  }`}
                />
              </div>
              {errors.phone && <p className="text-xs font-bold text-rose-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Fiche logistique */}
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Adresse de livraison
            </h3>

            {/* Zone de Dakar */}
            <div className="space-y-1.5">
              <label htmlFor="delivery-zone" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Quartier de livraison (Dakar)
              </label>
              <select
                id="delivery-zone"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className={`w-full h-12 px-4 bg-white border-2 border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-all ${
                  errors.zone ? 'border-rose-500 ring-1 ring-rose-500' : ''
                }`}
              >
                <option value="">Sélectionnez votre quartier...</option>
                {DAKAR_ZONES.map((zone) => (
                  <option key={zone.name} value={zone.name}>
                    {zone.name} ({formatPrice(zone.fee)})
                  </option>
                ))}
              </select>
              {errors.zone && <p className="text-xs font-bold text-rose-500 mt-1">{errors.zone}</p>}
            </div>

            {/* Adresse exacte */}
            <div className="space-y-1.5">
              <label htmlFor="delivery-address" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Adresse exacte & Repères
              </label>
              <input
                id="delivery-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Immeuble C, 3e étage, en face de la boulangerie Paul"
                className={`w-full h-12 px-4 bg-white border-2 border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-all ${
                  errors.address ? 'border-rose-500 ring-1 ring-rose-500' : ''
                }`}
              />
              {errors.address && <p className="text-xs font-bold text-rose-500 mt-1">{errors.address}</p>}
            </div>

            {/* Note livreur */}
            <div className="space-y-1.5">
              <label htmlFor="delivery-note" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Note pour le livreur (Optionnel)
              </label>
              <textarea
                id="delivery-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: Merci de m'appeler 15 minutes avant d'arriver."
                rows={2}
                className="w-full p-4 bg-white border-2 border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-all resize-none"
              />
            </div>
          </div>

          {/* Récapitulatif financier & Action */}
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Articles</span>
                <span className="font-bold">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Frais de livraison ({selectedZone || 'non définie'})</span>
                <span className="font-bold">{formatPrice(selectedZoneFee)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-dashed border-slate-200">
                <span>Total</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="h-12 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Continuer vers le paiement
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
