-- Ajout des colonnes GPS et date de livraison à la table orders
alter table public.orders
  add column if not exists "gpsLocation" text,
  add column if not exists "deliveryDate" date;
