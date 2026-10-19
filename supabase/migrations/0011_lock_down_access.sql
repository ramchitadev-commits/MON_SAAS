-- Ferme l'accès anon ouvert pour le prototype et isole commandes / livreurs par boutique.

drop policy if exists "prototype_all_access" on public.products;
drop policy if exists "prototype_all_access" on public.couriers;
drop policy if exists "prototype_all_access" on public.orders;
drop policy if exists "prototype_all_access" on public.order_items;
drop policy if exists "prototype_all_access" on public.shop_settings;

alter table public.orders
  add column if not exists "shopId" uuid references public.shop_settings("id") on delete cascade;

alter table public.couriers
  add column if not exists "shopId" uuid references public.shop_settings("id") on delete cascade;

create index if not exists idx_orders_shopId on public.orders ("shopId");
create index if not exists idx_couriers_shopId on public.couriers ("shopId");

alter table public.otp_codes add column if not exists "codeHash" text;
alter table public.otp_codes add column if not exists attempts integer not null default 0;
alter table public.otp_codes alter column code drop not null;

alter table public.otp_codes enable row level security;

-- Données de prototype : s'il n'y a qu'une boutique, on lui rattache les lignes sans shopId.
do $$
declare shop uuid;
begin
  if (select count(*) from public.shop_settings) = 1 then
    select id into shop from public.shop_settings limit 1;
    update public.orders set "shopId" = shop where "shopId" is null;
    update public.couriers set "shopId" = shop where "shopId" is null;
    update public.products set "shopId" = shop where "shopId" is null;
  end if;
end $$;

-- RLS reste actif sur les tables métier. Aucune policy anon :
-- le service role contourne RLS, le navigateur ne lit plus la base directement.
