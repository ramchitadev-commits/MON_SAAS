-- Correction du type de la colonne deliveryDate : text au lieu de date
-- pour accepter les strings ISO YYYY-MM-DD du client
alter table public.orders
  alter column "deliveryDate" set data type text;
