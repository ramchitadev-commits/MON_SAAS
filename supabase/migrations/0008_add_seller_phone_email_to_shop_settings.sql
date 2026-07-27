-- Ajout des champs seller_phone et seller_email pour le multi-tenancy (chaque vendeur a sa boutique)
alter table public.shop_settings
  add column if not exists seller_phone text,
  add column if not exists seller_email text;

-- Index pour récupérer rapidement la boutique d'un vendeur
create index if not exists idx_shop_settings_seller_phone
  on public.shop_settings(seller_phone);

create index if not exists idx_shop_settings_seller_email
  on public.shop_settings(seller_email);
