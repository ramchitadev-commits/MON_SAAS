# 🛠️ Plan d'implémentation — Doolé

> **But de ce document** : plan technique complet, ordonné et exécutable, destiné à un agent de code (Antigravity) qui va construire le MVP. Chaque tâche est atomique, ordonnée par dépendances, avec un **Definition of Done (DoD)**. Aucune ambiguïté laissée à l'agent.
>
> **Décisions déjà actées (ne pas re-débattre)** :
> - Paiement = **Option A** : lien Wave/Orange Money via agrégateur (Moneroo), l'argent va **directement** chez la vendeuse, Doolé reçoit un **webhook** « paiement confirmé ». Doolé ne touche jamais l'argent.
> - Livraison = **livreur propre** au MVP (notif auto SMS/WhatsApp). Intégration Paps/Yobanté = P2.
> - Business model = Freemium + Starter 3 000 FCFA/mois + Pro 7 000 FCFA/mois.
> - Web mobile-first, pas d'app native.
> - Architecture UX et écrans : voir `planning_ux-architecture-doole.md` (22 écrans, A1–A7 + V1–V15).

---

## 0. Stack technique imposée

| Couche | Techno | Notes |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** + **TypeScript** | Server Actions activées, RSC par défaut. |
| UI | **Tailwind CSS** | + `clsx`/`tailwind-merge`. Pas de librairie de composants lourde. |
| Backend / DB | **Supabase** (Postgres) | Auth (OTP téléphone), Realtime, Storage (images), RLS. |
| Auth vendeuse | **Supabase Auth — Phone OTP** | Provider SMS configuré (Twilio ou Africa's Talking). |
| Paiement | **Moneroo** (adapter générique) | Wave + Orange Money. Webhook signé. Adapter pour pouvoir swap PayTech. |
| Notifs livreur | **SMS (Africa's Talking ou Twilio)** + **WhatsApp (Twilio / Meta Cloud API)** | Via un service `notify` abstrait. |
| Validation | **Zod** | Tous les inputs (forms, server actions, webhooks). |
| State client (panier) | **Zustand** + `localStorage` | Panier persistant côté acheteur, par boutique. |
| Déploiement | **Vercel** | + Supabase hébergé. |
| Qualité | ESLint + Prettier + TypeScript strict | `strict: true`. |

> **Règle d'or perf** : tout écran acheteur est un Server Component avec données pré-rendues ; le client JS est minimal (panier, OTP, paiement). Images en `next/image` + format compressé.

---

## 1. Initialisation du projet

### Tâche 1.1 — Bootstrap
- `npx create-next-app@latest doole --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"`
- Activer TypeScript strict dans `tsconfig.json`.
- Installer : `@supabase/supabase-js @supabase/ssr zod zustand clsx tailwind-merge date-fns`.
- **DoD** : `npm run dev` démarre, page d'accueil par défaut s'affiche.

### Tâche 1.2 — Structure des dossiers
```
src/
  app/
    [slug]/                  # surface ACHETEUR (public)
      page.tsx               # A1 boutique
      p/[productId]/page.tsx # A2 produit
      panier/page.tsx        # A3
      livraison/page.tsx     # A4
      paiement/page.tsx      # A5
      confirmation/[orderId]/page.tsx  # A6
    suivi/[token]/page.tsx   # A7 suivi (public, par token)
    (seller)/                # surface VENDEUSE (auth)
      entrer/page.tsx        # V1
      entrer/code/page.tsx   # V2
      onboarding/page.tsx    # V3-V5 (multi-étapes)
      accueil/page.tsx       # V6
      commandes/page.tsx     # V7
      commandes/[id]/page.tsx# V8
      produits/page.tsx      # V9
      produits/nouveau/page.tsx   # V10
      produits/[id]/page.tsx # V10 édition
      livreurs/page.tsx      # V11
      livreurs/nouveau/page.tsx   # V12
      boutique/page.tsx      # V13
      abonnement/page.tsx    # V14
      compte/page.tsx        # V15
      layout.tsx             # layout vendeuse + bottom tab bar
    api/
      webhooks/payment/route.ts   # webhook paiement
  components/
    ui/                      # primitives (Button, Input, StatusPill, OtpInput...)
    buyer/                   # composants acheteur (ProductCard, CartLine...)
    seller/                  # composants vendeuse (OrderCard, BottomTabBar...)
  lib/
    supabase/                # clients (server, browser, admin/service-role)
    payment/                 # adapter Moneroo + types
    notify/                  # service SMS/WhatsApp
    validators/              # schémas Zod
    db/                      # data access (queries/mutations typées)
  store/                     # zustand (cart)
  types/                     # types partagés (Order, Product, Status...)
```
- **DoD** : arborescence créée, chaque `page.tsx` rend un placeholder identifiable.

### Tâche 1.3 — Variables d'environnement
Créer `.env.local` + `.env.example` :
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # serveur uniquement (webhooks)
NEXT_PUBLIC_APP_URL=              # ex: https://doole.sn
MONEROO_API_KEY=
MONEROO_WEBHOOK_SECRET=
SMS_PROVIDER_API_KEY=             # Africa's Talking / Twilio
SMS_PROVIDER_USERNAME=
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_ID=
```
- **DoD** : `.env.example` documenté, `lib` lit ces variables via un module `env.ts` validé par Zod (fail-fast au boot).

---

## 2. Base de données Supabase (schéma + RLS)

### Tâche 2.1 — Schéma SQL (migration)
Créer la migration avec ces tables. **Tous les montants sont en entiers FCFA (XOF), pas de décimales.**

```sql
-- ENUMS
create type order_status as enum
  ('en_attente','payee','a_envoyer','en_route','livre','annulee');
create type courier_channel as enum ('sms','whatsapp');
create type sub_plan as enum ('free','starter','pro');
create type pay_provider as enum ('wave','orange_money');

-- SELLERS (profil lié à auth.users)
create table sellers (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text not null,
  full_name text,
  created_at timestamptz default now()
);

-- SHOPS
create table shops (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references sellers(id) on delete cascade,
  name text not null,
  slug text not null unique,
  logo_url text,
  payout_phone text,                 -- numéro Wave/OM de réception
  payout_provider pay_provider,
  primary_color text default '#111111',
  is_active boolean default true,
  created_at timestamptz default now()
);
create index on shops(seller_id);

-- PRODUCTS
create table products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  name text not null,
  description text,
  price int not null check (price >= 0),
  images text[] default '{}',
  is_available boolean default true,
  stock int,                         -- null = stock illimité
  created_at timestamptz default now()
);
create index on products(shop_id);

-- PRODUCT VARIANTS (optionnel, simple)
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  label text not null,               -- ex "Taille M", "Rouge"
  price_delta int default 0,
  stock int
);

-- COURIERS
create table couriers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  name text not null,
  phone text not null,
  channel courier_channel not null default 'whatsapp',
  is_default boolean default false,
  created_at timestamptz default now()
);
create index on couriers(shop_id);

-- ORDERS
create table orders (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  delivery_zone text,
  delivery_address text,
  delivery_note text,
  subtotal int not null,
  delivery_fee int default 0,
  total int not null,
  status order_status not null default 'en_attente',
  payment_provider pay_provider,
  payment_ref text,                  -- référence provider
  tracking_token text not null unique default replace(gen_random_uuid()::text,'-',''),
  courier_id uuid references couriers(id),
  dispatched_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now()
);
create index on orders(shop_id);
create index on orders(status);
create index on orders(tracking_token);

-- ORDER ITEMS (snapshot prix/nom au moment de la commande)
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id),
  name text not null,
  unit_price int not null,
  quantity int not null check (quantity > 0),
  variant_label text
);
create index on order_items(order_id);

-- PAYMENTS (log webhooks)
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text,
  provider_ref text,
  amount int,
  status text,                       -- success/failed/pending
  raw jsonb,
  created_at timestamptz default now()
);

-- SUBSCRIPTIONS
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references sellers(id) on delete cascade,
  plan sub_plan not null default 'free',
  status text default 'active',
  current_period_end timestamptz,
  provider_ref text,
  created_at timestamptz default now()
);
create index on subscriptions(seller_id);
```
- **DoD** : migration appliquée sans erreur, tables visibles dans Supabase.

### Tâche 2.2 — Row Level Security (RLS)
Activer RLS sur toutes les tables. Politiques :

- **`sellers`** : un seller lit/écrit uniquement sa propre ligne (`id = auth.uid()`).
- **`shops`** : owner (`seller_id = auth.uid()`) full access. **Lecture publique (anon)** si `is_active = true` (pour la boutique publique).
- **`products` / `product_variants`** : owner full access via jointure `shop`. Lecture publique si la boutique parente est active et `is_available = true`.
- **`couriers`** : owner uniquement.
- **`orders`** : owner (via `shop`) lecture/écriture. **Insert public (anon)** autorisé pour créer une commande sur une boutique active. **Pas** de lecture publique directe → le suivi acheteur passe par une **RPC `get_order_by_token(token)`** en `security definer` qui renvoie un sous-ensemble safe (statut, items, livreur nom/tel, pas d'autres commandes).
- **`order_items`** : insert public lié à un order ; lecture via RPC suivi ou owner.
- **`payments`** / mutations de paiement / dispatch : **service role uniquement** (côté serveur, jamais client).
- **`subscriptions`** : owner lecture ; écriture service role (webhook abonnement).

- **DoD** : un client anon ne peut PAS lister les commandes d'une boutique ; il peut créer une commande et lire la sienne via token. Un seller A ne voit jamais les données du seller B (testé).

### Tâche 2.3 — Storage
- Bucket `shop-assets` (logos) — public read.
- Bucket `product-images` — public read, upload réservé owner.
- Politique : upload seulement par le seller propriétaire de la boutique.
- **DoD** : upload d'une image produit fonctionne et renvoie une URL publique.

---

## 3. Couche d'accès (clients Supabase + types)

### Tâche 3.1 — Clients Supabase (`lib/supabase`)
- `server.ts` : client RSC/Server Action (cookies, `@supabase/ssr`).
- `browser.ts` : client navigateur (anon).
- `admin.ts` : client **service role** (webhooks/serveur seulement, jamais importé côté client — ajouter un garde `import 'server-only'`).
- **DoD** : les 3 clients compilent, `admin.ts` inaccessible depuis un Client Component.

### Tâche 3.2 — Types & data access (`types/`, `lib/db/`)
- Générer les types depuis Supabase (`supabase gen types typescript`) → `types/database.ts`.
- Fonctions typées : `getShopBySlug`, `getProductsByShop`, `getProduct`, `createOrder`, `getOrderByToken`, `listOrders(filter)`, `getOrder`, `updateOrderStatus`, `dispatchOrder`, CRUD `products`, CRUD `couriers`, `get/upsertShopSettings`, `getSubscription`.
- **DoD** : chaque fonction a une signature typée et un test manuel minimal.

---

## 4. Design system minimal (`components/ui`)

### Tâche 4.1 — Tokens Tailwind
- Couleurs sémantiques statuts : `en_attente`=ambre, `payee`=vert, `a_envoyer`=ambre foncé, `en_route`=bleu, `livre`=vert foncé, `annulee`=rouge.
- Couleur boutique : variable CSS `--shop-color` injectée par la boutique (personnalisable).
- Typo lisible low-end (system font stack, pas de webfont lourd).
- Tap target min 48px.

### Tâche 4.2 — Primitives
`Button` (variants: primary plein-largeur, ghost), `Input`, `OtpInput` (4-6 cases auto-advance), `StatusPill` (mappe `order_status` → label FR + couleur), `BottomSheet`, `Skeleton`, `MoneyText` (format FCFA, ex `12 500 FCFA`), `Toast`.
- **DoD** : page de démo `/__ui` (dev only) affiche toutes les primitives.

### Tâche 4.3 — Composants métier
- Acheteur : `ProductCard`, `ProductGallery`, `CartLine`, `QuantityStepper`, `PayMethodButton` (Wave/OM).
- Vendeuse : `OrderCard`, `BottomTabBar` (4 onglets, badge commandes), `StatCard` (CA jour), `CourierPicker`.
- **DoD** : composants rendus dans `/__ui`.

---

## 5. Surface ACHETEUR (tunnel — P0)

> Tout en Server Components sauf panier/paiement (client). Le tunnel doit fonctionner en < 6 écrans.

### Tâche 5.1 — A1 Boutique publique (`/[slug]`)
- RSC : `getShopBySlug` + `getProductsByShop`. 404 si boutique inexistante/inactive.
- Header boutique (logo, nom, couleur), grille `ProductCard` (photo, nom, prix), recherche optionnelle (client, filtre liste déjà chargée).
- Bouton panier flottant (badge) si panier non vide.
- Injecter `--shop-color`.
- **DoD** : `/maison-fatou` affiche la boutique et ses produits, lazy images, lighthouse mobile perf ≥ 90.

### Tâche 5.2 — A2 Page produit (`/[slug]/p/[productId]`)
- Galerie photos, nom, **prix gros**, description, sélecteur de variantes.
- Bouton **Ajouter au panier** (bas, pleine largeur) → ajoute au store Zustand → retour boutique ou ouvre panier.
- **DoD** : ajout au panier persiste (reload conserve), variante prise en compte dans le prix.

### Tâche 5.3 — Store panier (`store/cart.ts`)
- Zustand + persist localStorage, **scopé par slug boutique** (un panier par boutique).
- API : `addItem`, `removeItem`, `setQty`, `clear`, `subtotal`.
- **DoD** : panier survit au reload, isolé par boutique.

### Tâche 5.4 — A3 Panier (`/[slug]/panier`)
- Liste `CartLine` (qté ±, suppression), **total en gros**, bouton **Commander** (bas).
- Vide → message + lien retour boutique.
- **DoD** : modification qté met à jour le total instantanément (optimistic).

### Tâche 5.5 — A4 Formulaire livraison (`/[slug]/livraison`)
- Champs : nom, téléphone (format SN `+221`, validation Zod), zone/quartier (select des zones boutique ou champ libre), adresse/repère, note.
- Calcule `delivery_fee` selon zone (P2 : tarifs par zone ; P0 : fee fixe ou 0 configurable).
- Bouton **Continuer vers le paiement**.
- **DoD** : validation bloque si tel/nom invalides ; données mises en store/temp.

### Tâche 5.6 — A5 Paiement (`/[slug]/paiement`)
- Récap montant total (sous-total + livraison).
- 2 gros boutons : **Wave** / **Orange Money**.
- Au clic : **Server Action `createOrder`** (status `en_attente`) → appel adapter Moneroo `createPayment` → renvoie URL de redirection provider → `redirect()`.
- **DoD** : commande créée en `en_attente`, redirection vers la page Wave/OM réelle (sandbox).

### Tâche 5.7 — A6 Confirmation (`/[slug]/confirmation/[orderId]`)
- Retour depuis provider. Lit la commande. Affiche ✅ « Commande confirmée », n° commande, récap.
- **Lien de suivi** (`/suivi/{token}`) avec boutons « Copier » + « Partager » (Web Share API → WhatsApp).
- Si statut encore `en_attente` (webhook pas encore reçu) : afficher « Paiement en cours de confirmation… » + auto-refresh / realtime.
- Vider le panier de cette boutique.
- **DoD** : après paiement sandbox réussi, l'écran passe à « confirmée » dès réception webhook.

### Tâche 5.8 — A7 Suivi commande (`/suivi/[token]` — P1)
- RSC via RPC `get_order_by_token`. Timeline statuts (En attente → Payée → À envoyer → En route → Livré). Affiche nom + tel livreur quand dispatché.
- Realtime sur la commande (subscribe par token) pour mise à jour live.
- **DoD** : changement de statut côté vendeuse se reflète sur l'écran suivi sans reload.

---

## 6. Auth & Onboarding VENDEUSE (P0)

### Tâche 6.1 — Config Supabase Phone Auth
- Activer Phone provider, brancher SMS provider (Twilio/Africa's Talking).
- **DoD** : un OTP réel arrive sur un téléphone de test.

### Tâche 6.2 — V1 Entrer (`/entrer`)
- 1 champ téléphone (format SN), bouton **Recevoir le code** → `supabase.auth.signInWithOtp({ phone })` → redirige `/entrer/code`.
- **DoD** : code envoyé, navigation vers l'écran code.

### Tâche 6.3 — V2 Code OTP (`/entrer/code`)
- `OtpInput`, auto-submit, `verifyOtp`. Renvoi du code (compte à rebours 30s).
- Au succès : si pas de `seller`/`shop` → `/onboarding`, sinon `/accueil`.
- **DoD** : OTP valide connecte ; session persistée (cookies SSR).

### Tâche 6.4 — Middleware d'auth
- `middleware.ts` : protège `(seller)/*` sauf `entrer`, `entrer/code`. Redirige non-connecté → `/entrer`.
- **DoD** : accès direct à `/accueil` non connecté → redirection.

### Tâche 6.5 — V3–V5 Onboarding (`/onboarding`)
- Étape 1 : nom boutique → slug auto (slugify + vérif unicité, suffixe si pris).
- Étape 2 : numéro Wave/OM de réception + provider.
- Étape 3 : 1er produit (photo + nom + prix) **skippable**.
- Fin : crée `seller`+`shop`(+produit), écran « Ta boutique est prête » + lien `NEXT_PUBLIC_APP_URL/{slug}` (copier/partager).
- **DoD** : à la fin, la boutique publique est accessible et partageable.

---

## 7. Surface VENDEUSE — gestion (P0)

### Tâche 7.1 — Layout vendeuse + BottomTabBar
- `(seller)/layout.tsx` : header léger + `BottomTabBar` (Accueil, Commandes [badge], Produits, Plus).
- **DoD** : navigation entre onglets fluide, badge = nb commandes `a_envoyer`/`payee` non traitées.

### Tâche 7.2 — V6 Accueil (`/accueil`)
- `StatCard` CA du jour (somme `total` des commandes `payee+` du jour), nb commandes à traiter (CTA → `/commandes`), bouton « Partager ma boutique ».
- Pas de graphe au MVP.
- **DoD** : chiffres corrects pour la journée en cours.

### Tâche 7.3 — V7 Commandes liste (`/commandes`)
- Filtres : À traiter / Payées / En route / Livrées / Toutes. Tri : à traiter en haut.
- `OrderCard` : client, total, `StatusPill`, heure.
- **Realtime** : nouvelle commande payée apparaît sans reload.
- **DoD** : filtres fonctionnent, realtime ajoute les nouvelles commandes.

### Tâche 7.4 — V8 Détail commande (`/commandes/[id]`)
- Infos client + adresse + tel (boutons **Appeler** / **WhatsApp** natifs), items, montants, `StatusPill`.
- Actions : **Dispatcher un livreur** (`CourierPicker`, ou auto si livreur par défaut), changer statut (À envoyer → En route → Livré), Annuler.
- Dispatch = Server Action `dispatchOrder` → `notify` livreur + set `courier_id`, `dispatched_at`, statut `en_route`.
- **DoD** : dispatch envoie réellement le message au livreur (sandbox) et met à jour le statut.

### Tâche 7.5 — V9/V10 Produits (`/produits`, `/produits/nouveau`, `/produits/[id]`)
- Liste (photo, nom, prix, dispo). Ajout/édition : upload image(s) Storage, nom, prix, variantes, stock optionnel, dispo on/off, suppression.
- **DoD** : CRUD complet ; produit ajouté visible immédiatement sur la boutique publique.

### Tâche 7.6 — V11/V12 Livreurs (`/livreurs`, `/livreurs/nouveau`)
- Liste livreurs, ajout (nom, tel, canal SMS/WhatsApp), définir **livreur par défaut** (= dispatch auto).
- **DoD** : un livreur par défaut existe ; le dispatch auto l'utilise.

---

## 8. Paiement — adapter Moneroo + webhook (P0, critique)

### Tâche 8.1 — Adapter paiement (`lib/payment`)
- Interface `PaymentProvider { createPayment(order, method): Promise<{url, ref}>; verifySignature(req): boolean; parseWebhook(body): {ref, status, amount} }`.
- Impl `moneroo.ts` : crée une transaction Wave/OM, retourne l'URL de redirection + ref. Stocke `payment_ref` sur l'order.
- **DoD** : `createPayment` renvoie une URL provider valide en sandbox.

### Tâche 8.2 — Webhook (`app/api/webhooks/payment/route.ts`)
- POST. **Vérifier la signature** (`MONEROO_WEBHOOK_SECRET`) → rejeter si invalide.
- Idempotent (même `provider_ref` traité 1 seule fois — log `payments`).
- Si `success` : `update orders set status='payee', paid_at=now()` via **service role** → puis **dispatch auto** si livreur par défaut → notif livreur → statut `en_route` (ou `a_envoyer` si pas de défaut).
- Si `failed` : statut `annulee`.
- Toujours logguer le raw dans `payments`.
- **DoD** : un webhook sandbox « success » fait passer la commande à `payee`, déclenche le dispatch, et est rejoué sans double effet (idempotence).

> ⚠️ C'est le **cœur du « zéro toucher »**. Le paiement n'est JAMAIS confirmé manuellement. Tout part du webhook.

---

## 9. Notifications livreur (`lib/notify`) (P0)

### Tâche 9.1 — Service notify
- Interface `notifyCourier(courier, order): Promise<void>` qui route selon `channel` (sms/whatsapp).
- Impl SMS (Africa's Talking/Twilio) + WhatsApp (Twilio/Meta Cloud API).
- **Template message** (FR) : `Nouvelle livraison 📦\nClient: {nom} ({tel})\nAdresse: {zone} - {adresse}\nMontant: {total} FCFA\nNote: {note}`.
- **DoD** : message reçu sur un numéro de test via les 2 canaux.

---

## 10. Realtime (P0/P1)

### Tâche 10.1 — Abonnements Realtime
- Vendeuse `/commandes` : subscribe `orders` filtré par `shop_id` → nouvelles commandes + changements de statut en live.
- Acheteur `/suivi/[token]` & `/confirmation` : subscribe sur la commande → statut live.
- **DoD** : changements propagés sans reload des deux côtés.

---

## 11. Abonnement (P2)

### Tâche 11.1 — V14 Abonnement (`/abonnement`)
- Affiche plan actuel + limites. **Freemium** : boutique active mais **dispatch auto désactivé** (la vendeuse doit dispatcher manuellement) → incitation upgrade.
- Upgrade Starter/Pro → paiement Wave/OM récurrent via Moneroo → met à jour `subscriptions`.
- Gating : `dispatchOrder` auto réservé aux plans payants ; vérif côté serveur.
- **DoD** : un compte free ne déclenche pas le dispatch auto ; un compte pro oui.

---

## 12. Perf & faible connexion (transversal, P0)

### Tâche 12.1 — Optimisations
- `next/image` partout, formats compressés, tailles responsive, lazy.
- Skeletons sur listes (boutique, commandes).
- Optimistic UI sur changements de statut + qté panier.
- Cache RSC + revalidation ciblée (`revalidatePath`) après mutations.
- Bundle client minimal (audit `@next/bundle-analyzer`).
- PWA légère (manifest + offline read du catalogue déjà chargé) — optionnel P1.
- **DoD** : Lighthouse mobile (throttling 3G) : Perf ≥ 85, écrans interactifs < 3s.

---

## 13. Déploiement

### Tâche 13.1 — Vercel + Supabase
- Connecter le repo à Vercel, variables d'env configurées (prod).
- Wildcard domaine / routing `doole.sn/{slug}` (slugs au niveau path, pas sous-domaine, pour le MVP).
- Configurer l'URL webhook Moneroo (prod) + secrets.
- Configurer Supabase Auth redirect URLs.
- **DoD** : un parcours complet (créer boutique → commander → payer sandbox → webhook → dispatch) fonctionne en prod.

---

## 14. Plan d'exécution par sprints (ordre de build)

> Chaque sprint est livrable et testable. Respecter l'ordre : les dépendances vont du haut vers le bas.

### Sprint 0 — Fondations (Tâches 1, 2, 3)
Bootstrap, schéma DB + RLS, clients Supabase, types. **Livrable** : DB prête, app vide qui boot.

### Sprint 1 — Design system (Tâche 4)
Primitives + composants métier + page `/__ui`. **Livrable** : kit UI réutilisable.

### Sprint 2 — Vendeuse: auth + onboarding (Tâche 6)
OTP → boutique créée → lien partageable. **Livrable** : une vendeuse peut créer sa boutique.

### Sprint 3 — Vendeuse: produits (Tâches 7.1, 7.5, 7.6)
Layout + tab bar, CRUD produits, livreurs. **Livrable** : boutique remplie de produits + livreur réglé.

### Sprint 4 — Acheteur: tunnel sans paiement réel (Tâches 5.1–5.5)
Boutique publique → produit → panier → livraison. **Livrable** : tunnel jusqu'au paiement (mock).

### Sprint 5 — Paiement + webhook (Tâches 5.6, 5.7, 8, 9)
Moneroo, redirection, webhook, dispatch auto, notif livreur. **Livrable** : le « zéro toucher » fonctionne de bout en bout (sandbox).

### Sprint 6 — Vendeuse: opérations (Tâches 7.2, 7.3, 7.4, 10)
Accueil (CA jour), liste commandes, détail + actions statut, realtime. **Livrable** : la vendeuse gère ses commandes en live.

### Sprint 7 — Suivi acheteur + perf (Tâches 5.8, 10, 12)
Suivi par token, optimisations faible connexion. **Livrable** : MVP P0 complet.

### Sprint 8 — P1/P2 (Tâches 11, 13 + paramètres, abonnement)
Paramètres boutique (V13), compte (V15), abonnement (V14), déploiement prod. **Livrable** : produit monétisable en prod.

---

## 15. Definition of Done global (MVP P0)

Le MVP est terminé quand, en environnement déployé :

1. ✅ Une vendeuse s'inscrit par OTP en < 2 min et obtient un lien `doole.sn/{slug}` partageable.
2. ✅ Elle ajoute des produits (avec photos) et un livreur par défaut.
3. ✅ Un acheteur, depuis le lien, commande et paie réellement par Wave/OM (sandbox) en < 6 écrans.
4. ✅ Le webhook fait passer la commande à « Payée » **sans action manuelle**.
5. ✅ Le livreur par défaut reçoit automatiquement un SMS/WhatsApp avec les infos de livraison.
6. ✅ La vendeuse voit la commande apparaître en temps réel et peut suivre/changer son statut.
7. ✅ L'acheteur peut suivre sa commande via le lien de suivi.
8. ✅ Tout est utilisable à une main, lisible en 3s, et performant en 3G (Lighthouse mobile ≥ 85).
9. ✅ RLS étanche : aucune fuite de données entre vendeuses ; pas de listing public des commandes.

---

## 16. Risques techniques & garde-fous (à signaler pendant le build)

| Risque | Garde-fou |
|---|---|
| Webhook non sécurisé | Vérif signature obligatoire + idempotence + service role only. |
| Double dispatch | Idempotence webhook + flag `dispatched_at` (ne dispatch pas 2x). |
| Fuite données via RLS mal posée | Tests d'isolation seller A / seller B avant tout le reste. |
| Service role exposé côté client | `import 'server-only'` sur `lib/supabase/admin.ts`. |
| Slugs en collision / réservés | Liste de slugs réservés (`entrer`, `accueil`, `api`, `suivi`, `onboarding`...) + suffixe auto. |
| Montants flottants | Tout en entiers FCFA. Aucun `float`. |
| Provider paiement indispo | Adapter abstrait pour swap PayTech/Moneroo sans toucher au reste. |
| Notif livreur échoue | Retry + log ; fallback : commande reste visible « à dispatcher » côté vendeuse. |

---

## 17. Référence croisée

- Architecture UX & écrans détaillés : `planning_ux-architecture-doole.md`
- PRD produit : `planning_prd-doole.md`
- Design brief (direction visuelle) : `planning_design-doole.md`
- Discovery (business model, choix paiement Option A, livreur propre) : `izisaas_R_cap_Discovery_Dool_.md`
</content>
