-- Ajout des colonnes logo et cutoffTime à la table shop_settings
alter table public.shop_settings
  add column if not exists "logo" text,
  add column if not exists "cutoffTime" text;
