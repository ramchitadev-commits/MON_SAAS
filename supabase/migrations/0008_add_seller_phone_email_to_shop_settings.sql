-- Ajout des champs sellerPhone et sellerEmail pour le multi-tenancy (chaque vendeur a sa boutique)
-- Noms en camelCase entre guillemets pour rester cohérent avec le reste du schéma (shopId, createdAt, ...)
alter table public.shop_settings
  add column if not exists "sellerPhone" text,
  add column if not exists "sellerEmail" text;

-- Index pour récupérer rapidement la boutique d'un vendeur
create index if not exists idx_shop_settings_seller_phone
  on public.shop_settings("sellerPhone");

create index if not exists idx_shop_settings_seller_email
  on public.shop_settings("sellerEmail");
