-- Ajout du champ sellerName pour afficher le prénom du vendeur dans le dashboard
alter table public.shop_settings
  add column if not exists "sellerName" text default 'Cher partenaire';
