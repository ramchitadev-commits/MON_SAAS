---
trigger: always_on
---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
---
# 🤖 Règles de Code de l'Agent — Doolé
Ces règles s'appliquent à tous les agents IA intervenant sur le projet Doolé. Elles doivent être respectées de manière stricte pour maintenir la cohérence visuelle et technique.
## 1. Respect du Système de Design (Flat & Notion)
*   Consultez et appliquez rigoureusement la charte graphique définie dans [planning_design-doole.md](file:///c:/Users/hp/Desktop/Mon_projet_saas_doolee/planning_design-doole.md).
*   **Interdiction d'utiliser des dégradés (`bg-gradient-to-...`)** ou des ombres floues (`shadow-lg`, `shadow-xl`) pour faire moderne/tech générique.
*   Utilisez des **bordures plates** (`border border-slate-200` ou `border-2 border-black`) et des **ombres décalées plates** (`shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`).
*   Privilégiez les aplats de couleurs pures (Emerald Green, Wave Blue, Orange Money, Noir, Blanc chaud `#FCFCFB`).
## 2. Approche Mobile-First & Performance 3G
*   Toute nouvelle interface doit être conçue en **mobile-first** avant d'être adaptée aux tablettes et ordinateurs.
*   Assurez-vous que toutes les cibles tactiles (boutons, liens) mesurent au moins **`48px`** de hauteur sur mobile.
*   N'importez pas de polices web tierces (Google Fonts). Utilisez la pile de polices système de Notion définie dans la charte.
*   Optimisez le chargement des images via `next/image` et lazy loading.
## 3. Architecture & Librairies
*   **Pas de librairies de composants lourdes** (pas de Radix UI complet, pas de DaisyUI, etc.). Coder des composants Tailwind personnalisés simples et propres.
*   **Zod** doit être utilisé pour valider systématiquement toutes les données entrantes (Server Actions, formulaires, payloads de webhooks).
*   Conservez la logique de stockage local dans `localStorage` via `src/lib/mockData.ts` pour les démonstrations de prototype, sauf si l'étape d'intégration Supabase est explicitement lancée.
*   Ne modifiez pas l'arborescence des dossiers ou l'architecture de routage sans plan validé au préalable par l'utilisateur.
# Design Brief — Doolé
# 🎨 Système de Design — Doolé
> Application web (SaaS) à concevoir pour un navigateur, responsive mobile + desktop. Le designer a toute autorité créative : palette, typographie, layout, composants, motion, densité, choix des écrans. Ce brief donne uniquement le pourquoi du projet et qui on sert. Si une direction non évoquée sert mieux le projet, prends-la.
Ce document définit la charte graphique et le système de design de **Doolé**, combinant la clarté structurée de **Notion** (bordures nettes, aplats neutres, contrastes élevés) avec l'énergie du **Flat Design** et de l'écosystème sénégalais (Wave Blue, Orange Money, Vert Émeraude).
---
## Le projet
## 1. Principes Fondamentaux de l'Esthétique
Doolé est une plateforme de social commerce pensée pour le Sénégal : une vendeuse pose un lien dans sa bio TikTok ou Instagram, son acheteur commande et paie par Wave ou Orange Money, et son livreur reçoit une notification automatique — sans qu'elle ait rien touché. Le problème résolu est brutal : aujourd'hui, chaque vente coûte 15 à 30 minutes de WhatsApp, de vocaux et de captures d'écran douteuses. Doolé compresse ça à zéro friction. Ce qui le rend différent : aucun concurrent ne combine boutique express + paiement mobile money direct vendeuse + dispatch automatique livreur sur ce marché.
*   **Pas de dégradés (No Gradients)** : Utilisez uniquement des couleurs d'arrière-plan plates et solides. Les dégradés arc-en-ciel ou violet/rose sont interdits.
*   **Bordures Prononcées (Notion & Flat UI)** : Les éléments interactifs (boutons, cartes, formulaires) se détachent par des bordures solides.
    *   Bordure standard : `border border-slate-200` (pour les blocs informatifs).
    *   Bordure interactive / Neo-brutaliste légère : `border-2 border-slate-900` ou `border-2 border-black`.
*   **Ombres Plates / Décalées (Block Shadows)** : Pas d'ombres diffuses (`shadow-lg`, `shadow-xl`). Utilisez des ombres de bloc nettes et colorées :
    *   Effet bouton / carte interactive : `shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]` ou `shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`.
    *   Au clic ou au survol : Translate de `1px` ou `2px` et réduction de l'ombre pour simuler le clic mécanique.
*   **Minimalisme Documentaire (Notion Canvas)** : Les fonds sont clairs, les polices sont lisibles, l'information est aérée mais dense.
---
## L'utilisateur
## 2. Palette de Couleurs (Tokens)
La vendeuse Doolé gère sa boutique depuis son téléphone, entre deux stories et deux DM, souvent debout au marché ou dans les transports. Elle revient sur Doolé pour voir ses commandes du jour, vérifier qu'un paiement est tombé, et savoir si son livreur a pris en charge la livraison. Sa frustration numéro un : ne pas savoir ce qui se passe — le client a-t-il payé ? Le livreur est-il parti ? Elle vit dans l'incertitude permanente.
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
## Le marché & contexte
## 3. Typographie & Densité
Dakar, Sénégal. 85%+ d'usage mobile sur navigateur — chaque écran Doolé doit être pensé pour une main, un pouce, une connexion 3G qui décroche. L'esthétique de référence locale, c'est la vitalité des feeds TikTok — couleur, rapidité, confiance immédiate.
*   **Police Système** : Pas de chargement de Google Fonts lourd pour optimiser les performances en 3G à Dakar. On utilise la pile de polices système de Notion :
    *   `font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;`
*   **Échelle des Titres** :
    *   `h1` (Titre de page) : `text-2xl md:text-3xl font-black tracking-tight text-slate-900`
    *   `h2` (Section) : `text-lg font-extrabold tracking-tight text-slate-900`
    *   `h3` (Sous-section/Carte) : `text-sm font-bold uppercase tracking-wider text-slate-500`
*   **Hauteur de clic (Tap Targets)** :
    *   Toutes les zones tactiles sur mobile (boutons, liens, inputs) font au minimum `48px` de haut pour une utilisation fluide à une main.
---
## À éviter (l'AI slop)
## 4. Composants Clés (Guide Tailwind)
- Gradients violet→rose partout, glow animé sur chaque bouton/card
- Sparkles ✨ et étoiles décoratives sur les CTAs
- Glassmorphism violet générique
- Hero avec 6+ CTAs, 12 logos clients placeholder, 8 chips bullshit
- Stock photos d'équipe générique (sourires forcés + MacBooks)
- Animated underline qui grandit au hover sur chaque lien
- Toute UI qui marche aussi bien pour ce projet que pour 50 autres SaaS
### Bouton Primaire (Flat & Contrasté)
```html
<button className="h-12 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer">
  Confirmer la commande
</button>
```
---
### Bouton Doolé (Émeraude)
```html
<button className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer">
  Ajouter un produit
</button>
```
## Ce qu'on attend
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
Une UI avec la vitalité d'un feed social et la clarté d'un reçu Wave. Doolé doit sentir la **confiance instantanée** — pas la startup tech froide, pas le marché artisanal approximatif. Quelque chose entre les deux : vivant, ancré, précis. Remplace "Doolé" par n'importe quel SaaS occidental — ça ne doit pas coller. L'app doit sentir Dakar.
