# 🏪 STOREFRONT DESIGN — LA DIVA COLLECTION

## Vue d'ensemble

Une **page de boutique en ligne premium et minimaliste** conçue pour **LA DIVA COLLECTION**, marque de mode basée à Dakar, Sénégal. L'interface allie élégance Shopify haut de gamme avec une esthétique épurée et moderne.

---

## 📐 Spécifications Visuelles

### Thème & Palette de Couleurs
- **Fond** : Blanc pur (#FFFFFF)
- **Texte principal** : Noir anthracite (#111827 / slate-900)
- **Accents** : Gris léger pour les bordures (slate-100, slate-200)
- **Actions** : Noir mat pour les boutons principaux
- **Mode** : Light par défaut, épuré et lumineux

### Typographie
- **Logo / Titre** : Serif font elegante (font-serif), tracking tight
- **Branding** : "DAKAR, SÉNÉGAL" en très petit, espacement large, couleur slate-400
- **Corps** : Tailwind système sans serif pour la légibilité
- **Hiérarchie** : Subtilement contrastée via `font-semibold` et `font-medium`

---

## 🎨 Composants Principaux

### 1. HEADER (En-tête sticky)
```
┌─────────────────────────────────────────────────────────┐
│ LA DIVA COLLECTION          [🛒 2]                      │
│ DAKAR, SÉNÉGAL                                          │
└─────────────────────────────────────────────────────────┘
```

**Caractéristiques :**
- Sticky en haut (z-30)
- Bordure inférieure fine (border-slate-100)
- Logo textuel élégant au centre/gauche
- Icône panier épurée à droite avec badge discret (noir, non voyant)
- Shadow-sm subtil

---

### 2. HERO SECTION (Annonce d'accueil)
**Concept** : Minimaliste, pas d'image de fond agressif

**Contenu :**
- Badge discret : "✓ Paiement Wave Direct & Livraison Express"
- Titre principal : "La mode à portée de clic" (grand, serif, tracking tight)
- Description : "Commandez en quelques instants, payez par mobile money et faites-vous livrer dans Dakar. Mode premium, service express."

**Style :**
- Fond blanc sans décoration
- Spacing aéré (py-12)
- Max-width limité (max-w-2xl pour titre)
- Badge en bg-slate-50 / border-slate-200 / px-3 py-1.5 rounded-full

---

### 3. SEARCH BAR (Barre de recherche)
```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Rechercher un article...                        [✕]  │
└─────────────────────────────────────────────────────────┘
```

**Détails :**
- Icône loupe (Lucide React) à gauche (pl-12)
- Bordure fine (border-slate-200, rounded-lg)
- Placeholder gris discret (slate-400)
- Bouton X à droite pour effacer (absolue, pr-4)
- Focus ring léger (ring-1 ring-slate-300)
- Pas de shadow agressif

---

### 4. GRILLE DE PRODUITS (Collection Grid)
**Disposition :** 3-4 colonnes sur desktop, 2 sur mobile, 1 sur très petit
```
gap-6 sm:grid-cols-3 lg:grid-cols-4
```

#### Carte Produit (individuelle)
```
┌─────────────────────┐
│   ┌──────────────┐  │
│   │              │  │
│   │   Image      │  │  ← aspect-square, rounded-lg
│   │   (hover 1.05x)│ │
│   │              │  │
│   └──────────────┘  │
│                     │
│ Robe Dashiki...    │
│ Robe trad. élégante│
│                     │
│ 45 000 FCFA Commander →
│                     │
└─────────────────────┘
```

**Comportements :**
- Image : hover:scale-105, transition-transform duration-300
- Texte : group-hover:translate-x-0.5 (subtil décalage)
- Stock badge : "Dernier(s) 2" si ≤3, fond noir, position top-3 left-3
- Rupture : overlay semi-transparent blanc avec "Rupture"
- Pas de bordure noire agressive (contrairement à l'ancien design)

---

### 5. STICKY CART BAR (Barre flottante panier)
```
┌──────────────────────────────────────────────────────┐
│ [🛒 Voir le panier 2]      45 000 FCFA              │
└──────────────────────────────────────────────────────┘
```

**Design :**
- Position fixe bas (bottom-0 left-0 right-0)
- Conteneur blanc avec bordure top (border-slate-100)
- Bouton interne : bg-slate-900 hover:bg-slate-800
- Texte blanc, spacing cohérent
- Rounded-xl pour douceur
- Badge panier : white bg / slate-900 text (inversé)
- Total bien visible à droite (font-semibold, tracking-tight)

---

### 6. FOOTER (Pied de page)
- Texte centré, très petit ([10px])
- Gris discret (text-slate-400)
- Font-light pour élégance
- Bordure top fine (border-slate-100)

---

## 🎯 Points de Différenciation

| Aspect | Ancien | **Nouveau** |
|--------|--------|-----------|
| Bordures | 2px border-slate-900 (harsh) | border-slate-200 (subtle) |
| Shadows | shadow-[3px_3px_0px] (bold) | shadow-sm ou aucune (soft) |
| Grille | 2 colonnes max | 3-4 colonnes (modern) |
| Interactions | Couleurs éclatantes | Hover subtils (scale, translate) |
| Typographie | Toutes tailles uniformes | Serif pour logo, hierarchy claire |
| Couleurs primaires | Vert/Amber | Noir & blanc + slate grays |

---

## 📱 Responsive Breakdown

### Mobile (< 640px)
- 1 colonne produits
- Header compact
- Search bar full-width
- Cart bar ajustée (padding réduit)
- Textes légèrement plus petits

### Tablet (640px - 1024px)
- 2-3 colonnes produits
- Header normal
- Spacing aéré maintenu
- Cart bar full-width

### Desktop (1024px+)
- 4 colonnes produits
- Max-width 4xl centré
- Spacing optimal (py-8, px-4)
- Hero text max-w-2xl

---

## 🚀 Points Clés d'Implémentation

1. **Pas de Dégradés** : Uniquement aplats et nuances de gris
2. **Ombres Plates** : Remplacées par border-slate-100/200 (flatter)
3. **Arrondi Doux** : rounded-lg (ronde mais pas excessif)
4. **Interactions Subtiles** : Hover = scale/translate/opacity, pas de changements de couleur agressifs
5. **Typographie Hiérarchique** : Serif pour prestige (header), sans-serif pour lisibilité
6. **Mobile-First** : Images lazy-load, 48px+ touch targets, spacing aéré

---

## 📂 Fichiers Modifiés

- **`src/app/[slug]/page.tsx`** : Composant principal de storefront avec:
  - Fallback defaults pour Supabase
  - Grid responsive 3-4 colonnes
  - Search filtrée client-side
  - Sticky cart bar avec calcul total
  
- **`src/app/demo-store/page.tsx`** : Page de démo statique avec données mockées
  - Affichage du design complet sans dépendances
  - URL : `http://localhost:3000/demo-store`

---

## 🎬 Comment Tester

### En local (développement)
```bash
npm run dev
# Accédez à: http://localhost:3000/demo-store
```

### Avec données réelles
- Assurez-vous que `shop_settings` contient une ligne en Supabase
- Assurez-vous que `products` contient des articles avec `isAvailable = true`
- La page `[slug]` chargera automatiquement depuis Supabase

---

## ✨ Highlights Design

✅ **Minimaliste premium** : Style Shopify haut de gamme sans excès  
✅ **Responsive intelligent** : 4 colonnes desktop → 1 colonne mobile  
✅ **Accessibilité** : Contrastes suffisants, touch targets 48px+  
✅ **Performance** : Images lazy, pas de librairies lourdes  
✅ **Marque forte** : Logo serif élégant, couleurs cohérentes  
✅ **Interactions fluides** : Hovers subtils, transitions smooth  

---

**Version** : 1.0 — Juillet 2026  
**Marque** : LA DIVA COLLECTION, Dakar, Sénégal  
**Designer** : Claude Code (Mode Expert UX/E-Commerce)
