-- ============================================================
-- Doolé — Schéma initial
-- ============================================================
-- Convention : les colonnes sont en camelCase (entre guillemets)
-- pour correspondre EXACTEMENT aux types TypeScript de src/types/index.ts.
-- Cela évite toute couche de "mapping" snake_case <-> camelCase côté app.
-- Les montants sont stockés en ENTIERS (FCFA, pas de centimes).
-- ============================================================

-- ---------- PRODUITS ----------
create table if not exists public.products (
  "id"          uuid primary key default gen_random_uuid(),
  "name"        text not null,
  "description" text not null default '',
  "price"       integer not null,
  "image"       text not null default '',
  "isAvailable" boolean not null default true,
  "stock"       integer,                      -- null = stock illimité
  "createdAt"   timestamptz not null default now()
);

-- ---------- LIVREURS ----------
create table if not exists public.couriers (
  "id"        uuid primary key default gen_random_uuid(),
  "name"      text not null,
  "phone"     text not null,
  "channel"   text not null check ("channel" in ('sms', 'whatsapp')),
  "isDefault" boolean not null default false,
  "createdAt" timestamptz not null default now()
);

-- ---------- COMMANDES ----------
create table if not exists public.orders (
  "id"              uuid primary key default gen_random_uuid(),
  "customerName"    text not null,
  "customerPhone"   text not null,
  "deliveryZone"    text not null,
  "deliveryAddress" text not null,
  "deliveryNote"    text,
  "subtotal"        integer not null,
  "deliveryFee"     integer not null,
  "total"           integer not null,
  "status"          text not null default 'en_attente'
                      check ("status" in ('en_attente','payee','a_envoyer','en_route','livre','annulee')),
  "paymentProvider" text not null check ("paymentProvider" in ('wave','orange_money')),
  "paymentRef"      text,
  "trackingToken"   text not null unique,
  "courierId"       uuid references public.couriers("id") on delete set null,
  "dispatchedAt"    timestamptz,
  "paidAt"          timestamptz,
  "createdAt"       timestamptz not null default now()
);

-- ---------- LIGNES DE COMMANDE ----------
create table if not exists public.order_items (
  "id"        uuid primary key default gen_random_uuid(),
  "orderId"   uuid not null references public.orders("id") on delete cascade,
  "productId" uuid references public.products("id") on delete set null,
  "name"      text not null,
  "unitPrice" integer not null,
  "quantity"  integer not null check ("quantity" > 0)
);

-- ---------- PARAMÈTRES BOUTIQUE ----------
create table if not exists public.shop_settings (
  "id"              uuid primary key default gen_random_uuid(),
  "name"            text not null,
  "description"     text not null default '',
  "payoutPhone"     text not null,
  "payoutProvider"  text not null check ("payoutProvider" in ('wave','orange_money')),
  "deliveryFee"     integer not null default 0,
  "createdAt"       timestamptz not null default now()
);

-- Index utiles pour les requêtes fréquentes
create index if not exists idx_orders_createdAt   on public.orders ("createdAt" desc);
create index if not exists idx_orders_trackingToken on public.orders ("trackingToken");
create index if not exists idx_order_items_orderId on public.order_items ("orderId");

-- ============================================================
-- SÉCURITÉ (RLS)
-- ============================================================
-- ⚠️ PROTOTYPE UNIQUEMENT : on active RLS mais avec des règles
-- "tout autorisé" pour la clé anon, afin que l'app fonctionne
-- immédiatement sans vraie authentification.
-- TODO (avant production) : remplacer ces policies permissives par
-- des règles strictes basées sur l'auth Supabase (chaque vendeuse
-- ne voit que SES produits/commandes).
-- ============================================================
alter table public.products      enable row level security;
alter table public.couriers      enable row level security;
alter table public.orders        enable row level security;
alter table public.order_items   enable row level security;
alter table public.shop_settings enable row level security;

do $$
declare t text;
begin
  foreach t in array array['products','couriers','orders','order_items','shop_settings']
  loop
    execute format(
      'create policy "prototype_all_access" on public.%I for all to anon, authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;
