-- Ajoute une colonne shopId à la table products pour lier les produits à une boutique
-- Puisqu'on a une seule boutique (table mono-ligne), on peut utiliser un flag simple
-- ou une colonne shopId avec une FK vers shop_settings.

alter table public.products add column if not exists "shopId" uuid default null;

-- Ajoute une FK vers shop_settings (optionnel mais bon pour l'intégrité)
alter table public.products
  add constraint fk_products_shopid
  foreign key ("shopId") references public.shop_settings("id") on delete cascade;

-- Index pour les requêtes par shopId
create index if not exists idx_products_shopId on public.products ("shopId");
