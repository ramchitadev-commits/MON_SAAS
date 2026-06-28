# 🎨 Système de Design — Doolé

Ce document définit la charte graphique et le système de design de **Doolé**, combinant la clarté structurée de **Notion** (bordures nettes, aplats neutres, contrastes élevés) avec l'énergie du **Flat Design** et de l'écosystème sénégalais (Wave Blue, Orange Money, Vert Émeraude).

---

## 1. Principes Fondamentaux de l'Esthétique

*   **Pas de dégradés (No Gradients)** : Utilisez uniquement des couleurs d'arrière-plan plates et solides. Les dégradés arc-en-ciel ou violet/rose sont interdits.
*   **Bordures Prononcées (Notion & Flat UI)** : Les éléments interactifs (boutons, cartes, formulaires) se détachent par des bordures solides.
    *   Bordure standard : `border border-slate-200` (pour les blocs informatifs).
    *   Bordure interactive / Neo-brutaliste légère : `border-2 border-slate-900` ou `border-2 border-black`.
*   **Ombres Plates / Décalées (Block Shadows)** : Pas d'ombres diffuses (`shadow-lg`, `shadow-xl`). Utilisez des ombres de bloc nettes et colorées :
    *   Effet bouton / carte interactive : `shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]` ou `shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`.
    *   Au clic ou au survol : Translate de `1px` ou `2px` et réduction de l'ombre pour simuler le clic mécanique.
*   **Minimalisme Documentaire (Notion Canvas)** : Les fonds sont clairs, les polices sont lisibles, l'information est aérée mais dense.

---

## 2. Palette de Couleurs (Tokens)

Toutes les couleurs sont définies par des aplats plats pour une esthétique épurée et contemporaine.

| Usage | Code Hexa / Tailwind | Description |
|---|---|---|
| **Fond Principal (Canvas)** | `#FCFCFB` / `bg-[#FCFCFB]` | Blanc chaud inspiré du papier/canvas Notion. |
| **Fond Secondaire** | `#F4F4F5` / `bg-slate-100` | Gris clair pour les sous-sections et tableaux. |
| **Texte Principal** | `#1A1A1A` / `text-slate-900` | Presque noir, haute lisibilité. |
| **Texte Secondaire** | `#5F5F5F` / `text-slate-500` | Gris neutre pour les légendes et textes d'aide. |
| **Couleur Signature Doolé** | `#00875A` / `bg-emerald-600` | Vert émeraude symbolisant la croissance et la monnaie. |
| **Bordure / Texte Actif** | `#000000` / `border-black` | Noir pur pour le contraste. |
| **Wave Blue** | `#00A3E0` / `bg-[#00A3E0]` | Bleu officiel de Wave pour l'association immédiate. |
| **Orange Money** | `#FF6600` / `bg-[#FF6600]` | Orange officiel de OM. |

---

## 3. Typographie & Densité

*   **Police Système** : Pas de chargement de Google Fonts lourd pour optimiser les performances en 3G à Dakar. On utilise la pile de polices système de Notion :
    *   `font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;`
*   **Échelle des Titres** :
    *   `h1` (Titre de page) : `text-2xl md:text-3xl font-black tracking-tight text-slate-900`
    *   `h2` (Section) : `text-lg font-extrabold tracking-tight text-slate-900`
    *   `h3` (Sous-section/Carte) : `text-sm font-bold uppercase tracking-wider text-slate-500`
*   **Hauteur de clic (Tap Targets)** :
    *   Toutes les zones tactiles sur mobile (boutons, liens, inputs) font au minimum `48px` de haut pour une utilisation fluide à une main.

---

## 4. Composants Clés (Guide Tailwind)

### Bouton Primaire (Flat & Contrasté)
```html
<button className="h-12 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer">
  Confirmer la commande
</button>
```

### Bouton Doolé (Émeraude)
```html
<button className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer">
  Ajouter un produit
</button>
```

### Carte Notion (Bordure fine, fond blanc, pas d'ombre)
```html
<div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Titre Carte</h3>
  <p className="text-sm text-slate-900">Contenu informatif...</p>
</div>
```

### Carte de Commande / Produit (Interactive, Flat Shadow)
```html
<div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
  {/* Contenu interactif */}
</div>
```

### Champ de Saisie (Notion style Input)
```html
<input 
  type="text" 
  className="w-full h-12 px-4 bg-white border-2 border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-all"
  placeholder="Ex: Fatou Diop"
/>
```

### Status Pills (Badges Plats & Pastels)
Les badges n'ont pas de dégradés ni d'icônes complexes.
*   **En attente** : `bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs px-2.5 py-1 rounded-full`
*   **Payée** : `bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold text-xs px-2.5 py-1 rounded-full`
*   **En route** : `bg-blue-100 text-blue-900 border border-blue-300 font-bold text-xs px-2.5 py-1 rounded-full`
*   **Livrée** : `bg-slate-900 text-white font-bold text-xs px-2.5 py-1 rounded-full` (Badge noir plein pour marquer la fin).
*   **Annulée** : `bg-rose-100 text-rose-900 border border-rose-300 font-bold text-xs px-2.5 py-1 rounded-full`