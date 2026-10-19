-- Table des codes de vérification OTP envoyés par SMS (via Brevo)
create table if not exists public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_otp_codes_phone on public.otp_codes(phone);
