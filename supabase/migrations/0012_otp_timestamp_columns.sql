-- La table otp_codes en production a été créée avec created_at / expires_at.
-- Si une copie a encore les noms camelCase, on les aligne.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'otp_codes' and column_name = 'createdAt'
  ) then
    alter table public.otp_codes rename column "createdAt" to created_at;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'otp_codes' and column_name = 'expiresAt'
  ) then
    alter table public.otp_codes rename column "expiresAt" to expires_at;
  end if;
end $$;
