# GEMINI.md — Doolé Project Context

> **Ce fichier est destiné aux agents IA (Gemini, Antigravity, etc.) intervenant sur ce projet.**
> Lire INTÉGRALEMENT avant d'écrire la moindre ligne de code.

---

## 1. Ce que fait l'application

**Doolé** est une plateforme SaaS de **social commerce** pensée pour les vendeuses sénégalaises.

Le parcours complet en 0 friction :
1. La **vendeuse** publie sa boutique Doolé (lien unique) dans sa bio TikTok / Instagram.
2. L'**acheteur** clique, parcourt le catalogue, ajoute au panier et commande.
3. Le paiement se fait directement par **Wave** ou **Orange Money** (mobile money).
4. La vendeuse voit la commande apparaître sur son tableau de bord, la dispatche vers un livreur.
5. L'**acheteur** suit sa livraison en temps réel via un lien de tracking unique.

**Problème résolu :** Chaque vente aujourd'hui coûte 15-30 min de WhatsApp, vocaux et captures d'écran. Doolé compresse ça à zéro.

---

## 2. Stack Technique

| Couche | Technologie | Version |
|---|---|---|
| Framework | **Next.js** | 16.3.0-preview.0 ⚠️ (pas la version stable 14/15 !) |
| Runtime UI | **React** | 19.2.7 |
| Styling | **Tailwind CSS** | v4 (PostCSS plugin `@tailwindcss/postcss`) |
| Icônes | **Lucide React** | 1.17.0 |
| Langage | **TypeScript** | v5 |
| Persistance (prototype) | **localStorage** uniquement (pas de BDD encore) |
| Persistance future | **Supabase** (prévu — pas encore intégré) |

> ⚠️ **IMPORTANT — Next.js 16 preview** : Les APIs peuvent différer de vos données d'entraînement.
> Lire `node_modules/next/dist/docs/` avant d'écrire du code Next.js.

---

## 3. Architecture des dossiers

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (metadata SEO)
│   ├── page.tsx                      # Redirect → /accueil
│   ├── globals.css                   # CSS global (Tailwind v4 @import)
│   │
│   ├── (seller)/                     # Groupe de routes — Espace Vendeur
│   │   ├── layout.tsx                # Layout vendeur : sidebar desktop + bottom nav mobile + badge commandes
│   │   ├── accueil/page.tsx          # Dashboard : CA du jour, commandes à traiter, lien boutique
│   │   ├── commandes/
│   │   │   ├── page.tsx              # Liste des commandes (filtre + recherche)
│   │   │   └── [id]/page.tsx         # Détail commande + changement statut + dispatch livreur
│   │   ├── produits/
│   │   │   ├── page.tsx              # Catalogue produits (toggle disponibilité, stats stock)
│   │   │   ├── nouveau/page.tsx      # Formulaire création produit (upload photo locale)
│   │   │   └── [id]/page.tsx         # Formulaire édition produit + suppression
│   │   ├── livreurs/
│   │   │   ├── page.tsx              # Liste des livreurs (définir par défaut, supprimer)
│   │   │   └── nouveau/page.tsx      # Formulaire ajout livreur (nom, téléphone, canal)
│   │   └── boutique/page.tsx         # Paramètres boutique (nom, description, numéro paiement)
│   │
│   ├── [slug]/                       # Espace Client Public (boutique en ligne)
│   │   ├── page.tsx                  # Vitrine boutique (catalogue + barre de recherche + panier flottant)
│   │   ├── p/[id]/page.tsx           # Fiche produit (détail + ajout panier)
│   │   ├── panier/page.tsx           # Panier (liste, quantités, total)
│   │   ├── livraison/page.tsx        # Formulaire livraison (nom, quartier, adresse, note)
│   │   ├── paiement/page.tsx         # Instruction paiement Wave/OM + saisie référence
│   │   └── confirmation/page.tsx     # Page de confirmation avec lien de suivi
│   │
│   └── suivi/[token]/page.tsx        # Tracking public (timeline état commande + infos livreur)
│
├── components/
│   └── logos/                        # Composant DooleLogo (SVG)
│
├── lib/
│   ├── mockData.ts                   # CRUD localStorage : produits, commandes, livreurs, paramètres boutique
│   └── cart.ts                       # Panier localStorage par boutique (slug-based)
│
└── types/
    └── index.ts                      # Types TypeScript : Product, Order, Courier, OrderItem, OrderStatus
```

---

## 4. Fonctionnalités Implémentées (Prototype)

### Espace Vendeur (`/accueil`, `/commandes`, `/produits`, `/livreurs`, `/boutique`)

| Fonctionnalité | Fichier | État |
|---|---|---|
| Dashboard (CA du jour, commandes urgentes, lien boutique) | `(seller)/accueil/page.tsx` | ✅ |
| Copie/partage du lien boutique (navigator.share / clipboard) | `(seller)/accueil/page.tsx` | ✅ |
| Liste des commandes avec filtres (à traiter, en route, livrées, annulées) | `(seller)/commandes/page.tsx` | ✅ |
| Recherche de commandes (nom client, ID) | `(seller)/commandes/page.tsx` | ✅ |
| Détail commande + changement de statut (payée → en route → livrée) | `(seller)/commandes/[id]/page.tsx` | ✅ |
| Dispatch vers livreur depuis le détail de commande | `(seller)/commandes/[id]/page.tsx` | ✅ |
| Catalogue produits (liste, disponibilité toggle) | `(seller)/produits/page.tsx` | ✅ |
| Création produit avec **upload photo locale** (FileReader → base64) | `(seller)/produits/nouveau/page.tsx` | ✅ |
| Édition produit avec photo locale (conserve ou remplace l'image) | `(seller)/produits/[id]/page.tsx` | ✅ |
| Suppression de produit | `(seller)/produits/[id]/page.tsx` | ✅ |
| Gestion des livreurs (ajout, suppression, définir par défaut) | `(seller)/livreurs/page.tsx` | ✅ |
| Ajout de livreur (nom, téléphone, canal SMS/WhatsApp) | `(seller)/livreurs/nouveau/page.tsx` | ✅ |
| Paramètres boutique (nom, description, numéro paiement, Wave/OM) | `(seller)/boutique/page.tsx` | ✅ |
| Badge commandes urgentes (sidebar + bottom nav) | `(seller)/layout.tsx` | ✅ |
| Réinitialisation données démo | `(seller)/layout.tsx` | ✅ |

### Espace Client (`/[slug]/...`)

| Fonctionnalité | Fichier | État |
|---|---|---|
| Vitrine boutique publique avec catalogue | `[slug]/page.tsx` | ✅ |
| Recherche de produits (nom + description) | `[slug]/page.tsx` | ✅ |
| Panier flottant (badge quantité + total) | `[slug]/page.tsx` | ✅ |
| Fiche produit détaillée | `[slug]/p/[id]/page.tsx` | ✅ |
| Panier (modifier quantités, supprimer, total) | `[slug]/panier/page.tsx` | ✅ |
| Formulaire livraison (nom, téléphone, quartier, adresse, note) | `[slug]/livraison/page.tsx` | ✅ |
| Instructions paiement Wave/OM + saisie référence | `[slug]/paiement/page.tsx` | ✅ |
| Page de confirmation avec lien de suivi unique | `[slug]/confirmation/page.tsx` | ✅ |
| Page de tracking commande (timeline + infos livreur + contact WhatsApp) | `suivi/[token]/page.tsx` | ✅ |

---

## 5. Modèles de Données (Types TypeScript)

```typescript
// src/types/index.ts

type OrderStatus = 'en_attente' | 'payee' | 'a_envoyer' | 'en_route' | 'livre' | 'annulee';
type PaymentProvider = 'wave' | 'orange_money';
type CourierChannel = 'sms' | 'whatsapp';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;          // en FCFA
  image: string;          // URL externe ou base64 data URL (upload local)
  isAvailable: boolean;
  stock: number | null;   // null = stock illimité
  createdAt: string;      // ISO 8601
}

interface Courier {
  id: string;
  name: string;
  phone: string;          // format: +221 XX XXX XX XX
  channel: CourierChannel;
  isDefault: boolean;
  createdAt: string;
}

interface OrderItem {
  id: string;
  productId?: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryZone: string;
  deliveryAddress: string;
  deliveryNote?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentProvider: PaymentProvider;
  paymentRef?: string;
  trackingToken: string;  // token unique pour URL de suivi : /suivi/[token]
  courierId?: string | null;
  dispatchedAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  items: OrderItem[];
}

// ShopSettings (dans src/lib/mockData.ts)
interface ShopSettings {
  name: string;
  description: string;
  payoutPhone: string;
  payoutProvider: 'wave' | 'orange_money';
  deliveryFee: number;
}
```

---

## 6. Persistance des données (localStorage)

Toutes les données sont stockées dans `localStorage` via `src/lib/mockData.ts`.

| Clé localStorage | Contenu |
|---|---|
| `doole_products` | `Product[]` |
| `doole_orders` | `Order[]` |
| `doole_couriers` | `Courier[]` |
| `doole_shop_settings` | `ShopSettings` |
| `doole_cart_[slug]` | `CartItem[]` (panier par boutique, géré via `src/lib/cart.ts`) |

Les fonctions CRUD disponibles dans `mockData.ts` :
- `getProducts()`, `getProductById(id)`, `saveProduct(product)`, `deleteProduct(id)`
- `getOrders()`, `getOrderById(id)`, `saveOrder(order)`
- `getCouriers()`, `saveCourier(courier)`, `deleteCourier(id)`
- `getShopSettings()`, `saveShopSettings(settings)`
- `initializeStorage()` — initialise avec les données mock si localStorage est vide
- `resetAllData()` — réinitialise toutes les données aux valeurs mock d'origine

---

## 7. Système de Design (OBLIGATOIRE à respecter)

Voir `planning_design-doole.md` et `AGENTS.md` pour la charte complète.

### Règles absolues :
- ❌ **Pas de dégradés** (`bg-gradient-to-...`)
- ❌ **Pas d'ombres floues** (`shadow-lg`, `shadow-xl`)
- ✅ **Ombres décalées plates** : `shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`
- ✅ **Bordures solides** : `border-2 border-slate-900` ou `border border-slate-200`
- ✅ **Fond principal** : `#FCFCFB` (blanc chaud Notion)
- ✅ **Couleur signature** : `#00875A` / `bg-emerald-600` (Vert Doolé)
- ✅ **Wave Blue** : `#00A3E0`, **Orange Money** : `#FF6600`
- ✅ **Police système** (pas de Google Fonts) : `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`
- ✅ **Cibles tactiles minimum** : `h-12` (48px) sur mobile
- ✅ **Mobile-first** : concevoir pour mobile d'abord, puis adapter en `md:`

### Pattern Bouton Primaire (exemple) :
```tsx
<button className="h-12 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer">
  Action principale
</button>
```

### Badges de statut commande :
- `en_attente` → `bg-amber-100 text-amber-900 border border-amber-300`
- `payee` → `bg-blue-100 text-blue-900 border border-blue-300`
- `en_route` → `bg-purple-100 text-purple-900 border border-purple-300`
- `livre` → `bg-slate-900 text-white` (badge noir plein)
- `annulee` → `bg-rose-100 text-rose-900 border border-rose-300`

---

## 8. Décisions de Design & Choix Architecturaux

### Pourquoi localStorage et pas Supabase ?
Le projet est en **phase prototype**. La valeur est de valider le parcours utilisateur complet avant d'investir dans une infrastructure backend. Supabase est prévu pour la phase suivante.

### Pourquoi le slug de boutique est dans l'URL ?
`/[slug]` permet à chaque vendeuse d'avoir une URL publique unique (ex: `/boutique-de-fatou`). Le slug est dérivé automatiquement du nom de la boutique (`settings.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')`).

### Pourquoi le panier est séparé du reste dans `cart.ts` ?
Le panier est propre à chaque boutique (`doole_cart_[slug]`). Un acheteur peut avoir des paniers dans plusieurs boutiques différentes. Cela prépare aussi l'architecture pour le multi-tenant Supabase.

### Upload photo locale → base64
Les images de produits sont converties en base64 via `FileReader` et stockées directement dans `localStorage`. Limite : ~5 Mo par image. En production Supabase, on utilisera **Supabase Storage** (bucket `product-images`).

### Rafraîchissement auto avec `setInterval`
Pour simuler le temps réel sans WebSocket, les pages vendeur rafraîchissent `localStorage` toutes les 2-3 secondes. Quand Supabase sera intégré, remplacer par les **Realtime Subscriptions** de Supabase.

### Tracking commande par token unique
Chaque commande a un `trackingToken` unique. L'URL `/suivi/[token]` est accessible sans authentification. Le token est généré côté client lors de la création de commande (`'token' + orderId`).

---

## 9. Ce qui reste à implémenter (Feuille de Route)

### Phase 2 — Supabase (priorité haute)
- [ ] Créer le projet Supabase + schéma SQL (tables : `products`, `orders`, `order_items`, `couriers`, `shops`)
- [ ] Remplacer toutes les fonctions `mockData.ts` par des appels Supabase Client
- [ ] Supabase Storage pour les images de produits
- [ ] Supabase Auth pour la vendeuse (magic link ou OTP SMS)
- [ ] Supabase Realtime pour les notifications de commande en temps réel

### Phase 3 — Paiement réel
- [ ] Intégration **Moneroo** (agrégateur Wave + Orange Money pour le Sénégal)
- [ ] Webhook Moneroo → mise à jour automatique `status = 'payee'`
- [ ] Génération de lien de paiement depuis la page `/[slug]/paiement`

### Phase 4 — Notifications
- [ ] Notification WhatsApp/SMS au livreur lors du dispatch (Africa's Talking ou Twilio)
- [ ] Notification SMS à l'acheteur lors du passage en `en_route`

### Phase 5 — Polish
- [ ] Authentification multi-boutiques (plusieurs vendeuses)
- [ ] Page analytics avancée (CA par période, meilleurs produits)
- [ ] Export des commandes (CSV)
- [ ] PWA (Progressive Web App) pour l'installation sur mobile

---

## 10. Commandes de développement

```bash
# Lancer le serveur de développement
npm run dev
# → http://localhost:3000

# URLs importantes en dev :
# Espace vendeur : http://localhost:3000/accueil
# Boutique cliente : http://localhost:3000/boutique-de-fatou
# Tracking : http://localhost:3000/suivi/token1024

# Build de production (seulement si demandé)
npm run build
```

---

## 11. Instructions pour un futur modèle IA

1. **Lire `AGENTS.md` et `planning_design-doole.md` EN PREMIER** — les règles de design sont strictes et non négociables.
2. **Ne pas installer de librairies lourdes** (Radix UI, DaisyUI, shadcn, etc.). Tout est en Tailwind custom.
3. **Ne pas utiliser `next/image`** sur les images base64 de produits — utiliser `<img>` natif avec le commentaire ESLint `{/* eslint-disable-next-line @next/next/no-img-element */}`.
4. **Toujours valider avec Zod** les données entrantes (Server Actions, formulaires).
5. **Ne pas modifier l'architecture des dossiers** sans plan validé par l'utilisateur.
6. **Ne pas migrer vers Supabase** sans que l'utilisateur ait explicitement demandé le lancement de cette phase.
7. **Pour les nouvelles pages vendeur** : les ajouter dans `src/app/(seller)/` pour hériter du layout (sidebar + bottom nav + badge).
8. **Pour les nouvelles pages client** : les ajouter dans `src/app/[slug]/` pour hériter du contexte boutique.
9. **Le polish est important** : l'app doit "sentir Dakar", pas une startup tech froide générique.
10. **Next.js 16 preview** : toujours vérifier `node_modules/next/dist/docs/` pour les APIs — elles peuvent différer de Next.js 13/14/15.
