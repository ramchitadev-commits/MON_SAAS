-- ============================================================
-- Migration 0010 : Ajout des abonnements (plan) et table d'audit des paiements
-- ============================================================

-- Ajouter la colonne plan à shop_settings (Gratuit, Starter, Pro)
ALTER TABLE public.shop_settings
ADD COLUMN "plan" text NOT NULL DEFAULT 'free'
CHECK ("plan" IN ('free', 'starter', 'pro'));

-- Ajouter les compteurs mensuels pour le gating des commandes
ALTER TABLE public.shop_settings
ADD COLUMN "currentMonthOrders" integer NOT NULL DEFAULT 0,
ADD COLUMN "currentMonthStart" timestamptz NOT NULL DEFAULT now();

-- Table d'audit pour les webhooks de paiement (historique + idempotence)
CREATE TABLE IF NOT EXISTS public.payments (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" uuid NOT NULL REFERENCES public.orders("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "providerRef" text NOT NULL,
  "amount" integer,
  "status" text NOT NULL,
  "raw" jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  -- Clé d'idempotence : un même (provider, providerRef) ne peut être inséré qu'une fois
  UNIQUE ("provider", "providerRef")
);

-- Index pour requêtes fréquentes sur payments
CREATE INDEX IF NOT EXISTS idx_payments_orderId ON public.payments ("orderId");
CREATE INDEX IF NOT EXISTS idx_payments_providerRef ON public.payments ("providerRef");

-- RLS pour payments (service role only, aucun accès anon/client)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_service_role_only" ON public.payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
