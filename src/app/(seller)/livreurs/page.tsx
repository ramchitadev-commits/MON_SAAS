'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, CheckCircle, MessageSquare, Phone, Mail } from 'lucide-react';
import { getCouriers, setDefaultCourier, deleteCourier } from '@/lib/couriers';
import { Courier } from '@/types';

export default function LivreursPage() {
  const [couriers, setCouriers] = useState<Courier[]>([]);

  useEffect(() => {
    getCouriers().then(setCouriers).catch((err) => console.error(err));
  }, []);

  const handleSetDefault = async (courierId: string) => {
    // Mise à jour optimiste
    setCouriers((prev) => prev.map((c) => ({ ...c, isDefault: c.id === courierId })));
    try {
      await setDefaultCourier(courierId);
    } catch (err) {
      console.error(err);
      // Resynchronise depuis la base en cas d'échec
      getCouriers().then(setCouriers).catch((e) => console.error(e));
      alert('Impossible de définir ce livreur par défaut. Réessayez.');
    }
  };

  const handleDelete = async (courierId: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce livreur ?')) {
      try {
        await deleteCourier(courierId);
        setCouriers((prev) => prev.filter((c) => c.id !== courierId));
      } catch (err) {
        console.error(err);
        alert('Suppression impossible. Réessayez.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            Mes Livreurs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez vos livreurs personnels et définissez le livreur par défaut pour l'envoi automatique.
          </p>
        </div>
        <Link
          href="/livreurs/nouveau"
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Link>
      </div>

      {/* Liste des livreurs */}
      {couriers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {couriers.map((courier) => (
            <div
              key={courier.id}
              className={`bg-white border-2 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between space-y-4 ${
                courier.isDefault ? 'border-emerald-600 ring-1 ring-emerald-500' : 'border-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-lg text-slate-900">{courier.name}</h3>
                    {courier.isDefault && (
                      <span className="bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Par défaut
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">{courier.phone}</p>
                </div>
                
                <button
                  onClick={() => handleDelete(courier.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Supprimer le livreur"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Raccourcis & Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  {courier.channel === 'whatsapp' ? (
                    <>
                      <MessageSquare className="h-4 w-4 text-emerald-500" /> Notifications WhatsApp
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 text-blue-500" /> Notifications SMS
                    </>
                  )}
                </span>

                {!courier.isDefault && (
                  <button
                    onClick={() => handleSetDefault(courier.id)}
                    className="h-9 inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 border border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer whitespace-nowrap"
                  >
                    Définir par défaut
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl text-center">
          <Trash2 className="h-12 w-12 text-slate-300 mb-2" />
          <h3 className="text-base font-bold text-slate-700">Aucun livreur configuré</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Ajoutez votre premier livreur personnel pour pouvoir dispatcher vos commandes.
          </p>
          <Link
            href="/livreurs/nouveau"
            className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 border border-black"
          >
            <Plus className="h-4 w-4" /> Ajouter mon premier livreur
          </Link>
        </div>
      )}
    </div>
  );
}
