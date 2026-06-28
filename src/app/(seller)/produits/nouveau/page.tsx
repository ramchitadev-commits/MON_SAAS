'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, X, Upload } from 'lucide-react';
import { createProduct } from '@/lib/products';

export default function NouveauProduitPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isStockUnlimited, setIsStockUnlimited] = useState(true);
  const [stock, setStock] = useState('10');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image (JPG, PNG, WEBP...).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image est trop lourde (max 5 Mo).');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeImage = () => {
    setImagePreview(null);
    setImageName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Veuillez entrer un nom de produit.');
      return;
    }

    const priceNum = parseInt(price);
    if (isNaN(priceNum) || priceNum < 0) {
      alert('Veuillez entrer un prix valide (supérieur ou égal à 0).');
      return;
    }

    try {
      await createProduct({
        name,
        description,
        price: priceNum,
        image: imagePreview || '',
        isAvailable: true,
        stock: isStockUnlimited ? null : parseInt(stock) || 0,
      });
      router.push('/produits');
    } catch (err) {
      console.error(err);
      alert('Création impossible. Vérifiez votre connexion et réessayez.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/produits')}
          className="inline-flex items-center justify-center p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            Ajouter un produit
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Remplissez les détails pour publier un nouvel article.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3">
        {/* Colonne gauche/milieu : Informations */}
        <div className="md:col-span-2 space-y-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          {/* Nom du produit */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nom de l&apos;article *
            </label>
            <input
              type="text"
              id="name"
              placeholder="Ex: Robe Wax Silhouette Rose"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Description (facultatif)
            </label>
            <textarea
              id="description"
              placeholder="Décrivez l'article, la matière, les tailles existantes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Prix */}
            <div className="space-y-1.5">
              <label htmlFor="price" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Prix en FCFA *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  placeholder="Ex: 15000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-4 pr-16 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  required
                  min="0"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-bold text-slate-400 pointer-events-none">
                  FCFA
                </span>
              </div>
            </div>

            {/* Gestion Stock */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Stock
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockUnlimited(true)}
                  className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isStockUnlimited
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  Illimité
                </button>
                <button
                  type="button"
                  onClick={() => setIsStockUnlimited(false)}
                  className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    !isStockUnlimited
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  Limité
                </button>
              </div>
            </div>
          </div>

          {/* Saisie Quantité si Stock Limité */}
          {!isStockUnlimited && (
            <div className="space-y-1.5 bg-slate-50 p-4 border border-slate-200 rounded-xl">
              <label htmlFor="stock" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Quantité en stock disponible
              </label>
              <input
                type="number"
                id="stock"
                placeholder="10"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                min="0"
              />
            </div>
          )}
        </div>

        {/* Colonne droite : Photo */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Camera className="h-4 w-4" /> Photo du produit
            </h3>

            {/* Zone d'upload / Aperçu */}
            {imagePreview ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-emerald-500 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Aperçu produit"
                  className="w-full h-full object-cover"
                />
                {/* Bouton supprimer */}
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors cursor-pointer"
                  aria-label="Supprimer la photo"
                >
                  <X className="h-4 w-4" />
                </button>
                {/* Nom du fichier */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-1.5">
                  <p className="text-white text-[10px] font-medium truncate">{imageName}</p>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/40'
                }`}
              >
                <div className="p-3 bg-white border-2 border-slate-200 rounded-xl shadow-sm">
                  <Upload className={`h-6 w-6 transition-colors ${isDragging ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-bold text-slate-700">
                    {isDragging ? 'Déposez ici' : 'Choisir une photo'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    JPG, PNG, WEBP · Max 5 Mo
                  </p>
                </div>
              </div>
            )}

            {/* Input file caché */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleInputChange}
            />

            {/* Bouton secondaire si image déjà choisie */}
            {imagePreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/40 rounded-xl text-xs font-bold text-slate-500 hover:text-emerald-700 transition-all cursor-pointer"
              >
                Changer la photo
              </button>
            )}
          </div>

          {/* Action validation */}
          <button
            type="submit"
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
          >
            Créer et Publier le Produit
          </button>
        </div>
      </form>
    </div>
  );
}
