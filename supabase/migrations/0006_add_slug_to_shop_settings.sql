-- Ajoute une colonne slug à shop_settings pour mapper les URLs publiques aux boutiques
-- Cette colonne est UNIQUE pour assurer l'isolation des données multi-tenancy

alter table public.shop_settings
  add column if not exists "slug" text unique;

-- Index pour les requêtes fréquentes par slug (lookup depuis la storefront publique)
create index if not exists idx_shop_settings_slug on public.shop_settings ("slug");
