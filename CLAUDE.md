# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Quick Start

**Tech Stack**: Next.js 15 + TypeScript + Tailwind CSS + Supabase + Zod

**Install & Develop**:
```bash
npm install                    # Install dependencies
npm run dev                    # Start dev server (http://localhost:3000)
npm run lint                   # Run ESLint
npm run type-check            # TypeScript check
npm run build && npm run start # Production build & run
```

**Supabase Local Development**:
```bash
supabase start                 # Start local Supabase stack
supabase migration new [name]  # Create a new migration
supabase db push              # Apply migrations to remote
supabase gen types typescript > src/types/database.ts  # Regenerate types
supabase stop                 # Stop local stack
```

---

## Project Overview

**Doolé** is a multi-tenant SaaS marketplace for Senegalese mobile vendors:
- **Seller Dashboard**: Manage products, orders, couriers, and shop settings
- **Client Storefront**: Phone-based storefront per seller (identified by slug)
- **Order Management**: Multi-step checkout → Payment (Wave/Orange Money) → Courier dispatch
- **Multi-Tenancy**: Each seller isolated via shop ID and RLS (Row Level Security)

---

## Project Architecture

### Core Structure

```
src/
├── app/                    # Next.js App Router (v15)
│   ├── (seller)/          # Seller dashboard routes (protected)
│   │   ├── accueil/       # Dashboard home
│   │   ├── commandes/     # Orders management
│   │   ├── produits/      # Products (CRUD)
│   │   ├── livreurs/      # Couriers management
│   │   ├── boutique/      # Shop settings & configuration
│   │   ├── entrer/        # Authentication (phone/OTP)
│   │   ├── onboarding/    # Initial seller setup
│   │   └── layout.tsx     # Seller layout with nav
│   ├── [slug]/            # Client storefront (multi-tenant)
│   │   ├── page.tsx       # Shop homepage
│   │   ├── p/[productId]/ # Product detail
│   │   ├── panier/        # Shopping cart
│   │   ├── paiement/      # Payment provider selection
│   │   ├── livraison/     # Delivery info
│   │   └── confirmation/  # Order confirmation
│   ├── suivi/[token]/     # Public order tracking (SMS links)
│   ├── tarifs/            # Pricing page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   └── logos/            # Brand logo
├── lib/                   # Business logic & utilities
│   ├── supabase.ts       # Supabase client (lazy-initialized)
│   ├── auth.ts           # Session management (sessionStorage-based)
│   ├── shop.ts           # Shop queries & multi-tenancy helpers
│   ├── products.ts       # Product CRUD & stock verification
│   ├── orders.ts         # Order management & item relations
│   ├── couriers.ts       # Courier (livreur) management
│   ├── settings.ts       # Shop settings & logo uploads
│   ├── cart.ts           # Client-side cart logic
│   ├── otp.ts            # OTP generation/verification (Brevo SMS)
│   ├── designTokens.ts   # Color/spacing constants (flat design)
│   └── mockData.ts       # Demo data (localStorage fallback)
├── types/
│   └── index.ts          # TypeScript interfaces (Order, Product, etc.)
└── styles/
    └── globals.css       # Global Tailwind styles

supabase/
├── migrations/           # SQL migrations (9 total)
│   ├── 0001_init_schema.sql
│   ├── 0002-0008_*.sql   # Progressive schema evolution
│   └── 0009_add_otp_codes.sql
└── seed.sql             # Initial demo data

middleware.ts            # Route guards & redirects
next.config.ts          # Next.js config
tsconfig.json           # TypeScript strict mode + @ alias
postcss.config.mjs      # PostCSS/Tailwind config
.env.local              # Supabase + Brevo credentials
```

### Next.js 15 Specifics

⚠️ **This is NOT standard Next.js.** Check `node_modules/next/dist/docs/` for breaking changes before implementing features.

### Multi-Tenancy & Security

**Multi-Tenancy via RLS (Row Level Security)**:
- Each seller has a unique `shop_settings` record with `sellerPhone`, `sellerEmail`, and `slug`
- All data (products, orders) linked to a specific shop via `shopId`
- RLS policies enforce shop isolation at the database level
- ⚠️ **Current RLS policies are permissive (for prototyping)** — must be hardened before production

**Authentication**:
- Phone-based OTP via Brevo SMS API (`src/lib/otp.ts`)
- Session stored in `sessionStorage` (cleared on tab close, not persistent)
- No traditional Supabase Auth — custom OTP logic
- Seller login: `/entrer` (phone) → `/entrer/code` (OTP verification)

**Data Validation**:
- **All incoming data** must be validated with Zod
- Server Actions and form submissions validate before DB operations
- Example: `productInputSchema`, `orderInputSchema` in validation layers

---

## Design System & Styling

### Flat & Notion-Inspired (MANDATORY)

This is a strict design system. Violations are visible and will be flagged.

**No Gradients, No Soft Shadows**:
- ❌ `bg-gradient-to-r`, `shadow-lg`, `shadow-xl` — FORBIDDEN
- ✅ Solid colors + flat borders + offset shadows only

**Color Palette** (fixed, do not invent):
- **Canvas**: `#FCFCFB` / `bg-white` (warm white, not pure white)
- **Secondary BG**: `#F4F4F5` / `bg-slate-100`
- **Primary Text**: `#1A1A1A` / `text-slate-900`
- **Secondary Text**: `#5F5F5F` / `text-slate-500`
- **Doolé Green** (signature): `#00875A` / `bg-emerald-600`
- **Wave Blue**: `#00A3E0` / `bg-sky-500`
- **Orange Money**: `#FF6600` / `bg-orange-500`
- **Borders**: `border-black` (pronounced) or `border-slate-200` (subtle)

**Shadows & Borders**:
- Flat, offset shadows: `shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]` or `shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`
- Borders are structural: `border-2 border-black` or `border border-slate-200`
- Interactive hover: reduce shadow & offset with `translate-x-0.5 translate-y-0.5`
- No rounded corners unless explicitly specified in design system

**Typography**:
- Font stack: System fonts only (no Google Fonts, no external CDNs)
- Default: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- Tailwind `font-sans` is safe

**See Also**: [AGENTS.md](AGENTS.md) and [planning_design-doole.md](planning_design-doole.md) for full design rules and component examples.

### Mobile-First & Performance

- **Design starts with mobile**, then enhance for tablet/desktop
- **Touch targets**: All interactive elements ≥ 48px height on mobile
- **Images**: Always use `next/image` with `sizes` prop and lazy loading
- **Fonts**: System stack only — no web fonts (critical for 3G in Dakar market)
- **Code Splitting**: Routes auto-split; use dynamic imports for heavy components

---

## Database Schema

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `shop_settings` | Seller profile & shop config | `id`, `slug` (unique), `name`, `sellerPhone`, `sellerEmail`, `payoutPhone`, `payoutProvider`, `deliveryFee`, `logo`, `cutoffTime` |
| `products` | Inventory per shop | `id`, `shopId`, `name`, `description`, `price`, `image`, `stock` (nullable = unlimited), `isAvailable` |
| `orders` | Customer orders | `id`, `shopId`, `customerName`, `customerPhone`, `deliveryAddress`, `deliveryZone`, `deliveryDate`, `total`, `paymentProvider`, `paymentRef`, `status` (enum), `trackingToken`, `courierId`, `dispatchedAt`, `paidAt` |
| `order_items` | Order line items | `id`, `orderId`, `productId`, `name`, `unitPrice`, `quantity` |
| `couriers` | Delivery personnel per shop | `id`, `shopId`, `name`, `phone`, `channel` (sms/whatsapp), `isDefault` |
| `otp_codes` | SMS auth codes | `id`, `phone`, `code`, `expiresAt` (5-min TTL) |

### Order Status Enum
```
'en_attente'  # Awaiting payment
'payee'       # Paid, ready to dispatch
'a_envoyer'   # (internal state)
'en_route'    # With courier
'livre'       # Delivered
'annulee'     # Cancelled
```

### Payment Providers
```
'wave'         # Wave Money integration
'orange_money' # Orange Money integration
```

**All column names use camelCase** (e.g., `deliveryAddress`, not `delivery_address`) to match TypeScript types directly.

---

## Common Development Tasks

### Creating a New Seller Dashboard Page

1. **Create file** in `src/app/(seller)/[section]/page.tsx` or `src/app/(seller)/[section]/[id]/page.tsx`
2. **Use Server Components by default** (no `'use client'` unless interactive)
3. **Fetch data server-side** from `src/lib/` helpers (products, orders, etc.)
4. **Import components** from `src/components/`
5. **Validate user auth** before rendering (check session in `src/lib/auth.ts`)

Example:
```typescript
// src/app/(seller)/produits/page.tsx
import { getProducts } from '@/lib/products';

export default async function ProductsPage() {
  const products = await getProducts();
  return <div>/* render products */</div>;
}
```

### Creating a Form with Server Action

1. **Define validation schema** in `src/lib/` or colocated:
```typescript
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name required'),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().int().nullable(),
});
```

2. **Create Server Action** (in same file or separate):
```typescript
'use server';
import { createProductSchema } from '@/lib/validation';

export async function createProduct(formData: FormData) {
  const data = Object.fromEntries(formData);
  const validated = createProductSchema.parse(data);
  // Insert into Supabase via src/lib/products.ts
}
```

3. **Create form component**:
```typescript
'use client';
import { createProduct } from '@/lib/products';

export function ProductForm() {
  return (
    <form action={createProduct}>
      <input type="text" name="name" required />
      <input type="number" name="price" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Adding a UI Component

- **No heavy libraries** (no Radix, no DaisyUI)
- **Use Tailwind + custom logic** only
- **Keep simple** — only add complexity when needed
- **Place in** `src/components/ui/` (e.g., `Button.tsx`, `Modal.tsx`)

Example Button with flat design:
```typescript
// src/components/ui/Button.tsx
export function Button({ children, variant = 'primary', ...props }) {
  const baseClass = 'px-4 py-2 border-2 transition-all';
  const variants = {
    primary: `${baseClass} bg-emerald-600 text-white border-emerald-700
      shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]
      hover:translate-x-0.5 hover:translate-y-0.5
      hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)]`,
    secondary: `${baseClass} bg-slate-100 text-slate-900 border-slate-300
      shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]
      hover:translate-x-0.5 hover:translate-y-0.5
      hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)]`,
  };
  return <button className={variants[variant]} {...props}>{children}</button>;
}
```

### Querying Supabase

**Pattern**: Use typed helpers from `src/lib/` for type-safe queries.

```typescript
// Example: Get current seller's products
import { getProducts } from '@/lib/products';
import { getActiveShopId } from '@/lib/shop';

export async function getSellerProducts() {
  const shopId = await getActiveShopId(); // Get from session
  return getProducts(shopId);
}
```

**Key Rules**:
- RLS enforces isolation; still filter by `shopId` explicitly
- Use `src/types/index.ts` for TypeScript interfaces
- Handle errors explicitly (Supabase returns `{ data, error }`)
- All database operations in `src/lib/` (not scattered across components)

### Adding a Database Migration

1. **Create migration file**:
```bash
supabase migration new add_feature_name
```

2. **Write SQL** in `supabase/migrations/TIMESTAMP_add_feature_name.sql`:
```sql
-- Add a new column to products
ALTER TABLE products ADD COLUMN discount_percent INT DEFAULT 0;

-- Or create a new table with RLS
CREATE TABLE shop_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES shop_settings(id) ON DELETE CASCADE,
  code text NOT NULL,
  discount_percent int NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(shop_id, code)
);

ALTER TABLE shop_promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own shop's promotions" ON shop_promotions
  FOR ALL USING (shop_id IN (
    SELECT id FROM shop_settings 
    WHERE seller_phone = auth.jwt() ->> 'phone' -- or your auth logic
  ));
```

3. **Test locally**:
```bash
supabase db push
```

4. **Regenerate TypeScript types**:
```bash
supabase gen types typescript > src/types/database.ts
```

5. **Commit** migration + regenerated types together

---

## Key Rules & Constraints

### Architecture Rules (from [AGENTS.md](AGENTS.md))

✅ **DO**:
- Mobile-first design, then tablet/desktop
- Flat design only (no gradients, soft shadows)
- System fonts only (no external CDNs)
- Zod validation for all input data
- Server Components by default; use `'use client'` sparingly
- RLS-based multi-tenancy (all queries filter by shop)
- Custom Tailwind components (no heavy libraries)

❌ **DO NOT**:
- Use gradients or soft shadows
- Import Google Fonts or external web fonts
- Use heavy component libraries (Radix, DaisyUI, Shadcn)
- Modify folder structure without explicit user approval
- Hardcode data (use `src/lib/mockData.ts` for demos)

### Code Quality

- **TypeScript**: Strict mode enabled; no `any` except justified edge cases
- **Linting**: Run `npm run lint` before committing
- **Type Checking**: Run `npm run type-check` to verify
- **Formatting**: Prettier configured (if available, use `npm run format`)

---

## Common Patterns & Gotchas

### Hydration / Client-Side State

**Problem**: Reading `window` or `localStorage` during server-side render causes hydration mismatch.

**Solution**: Use mounted guard pattern.
```typescript
'use client';
import { useEffect, useState } from 'react';

export function Component() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // Don't render until hydrated
  
  const value = localStorage.getItem('key');
  return <div>{value}</div>;
}
```

**See Also**: Memory note [[hydration-mounted-guard]]

### Multi-Tenancy Isolation

**Problem**: Without proper RLS + filtering, data leaks between shops.

**Solution**:
1. Always filter queries by `shop_id` via RLS policies
2. Get `shop_id` from session/auth context, **not** from user input
3. Test with multiple shops to verify isolation

**See Also**: Memory note [[multi_tenancy_fix]]

### Order Status Transitions

Orders flow through states:
```
en_attente (awaiting payment)
  ↓
payee (payment received, ready to dispatch)
  ↓
a_envoyer (internal, transitional)
  ↓
en_route (courier assigned & en route)
  ↓
livre (delivered)

OR annulee (at any point)
```

Always validate transitions server-side before updating status.

### OTP / Phone-Based Auth

- **Generation**: `src/lib/otp.ts` → Brevo SMS API
- **Verification**: 5-minute TTL, 30-second anti-spam cooldown
- **Storage**: `otp_codes` table (not Supabase Auth)
- **Session**: On successful verify, store phone in `sessionStorage`
- **Flow**: `/entrer` (phone input) → SMS sent → `/entrer/code` (OTP verify) → Dashboard

---

## Testing & Debugging

**Type Error in Supabase Query?**
- Regenerate types: `supabase gen types typescript > src/types/database.ts`
- Check column names match database schema

**Data Leaking Between Shops?**
- Verify RLS policies are enabled on the table
- Check that queries filter by current `shop_id`
- Use Supabase dashboard to inspect RLS policy SQL

**Hydration Mismatch / "Text content mismatch"?**
- Check for `window`, `localStorage`, `document` reads outside `useEffect`
- Use mounted guard pattern (see Patterns section)

**Next.js Dev/Build Error?**
- Check `node_modules/next/dist/docs/` for version-specific issues
- Ensure Server Actions are in `'use server'` marked files
- Verify no circular imports between `src/lib/` files

---

## Supabase Multi-Tenancy Hardening

Before production:
- [ ] Review all RLS policies — ensure users cannot see other shops' data
- [ ] Test that `auth.jwt()` or session context correctly maps to `shop_id`
- [ ] Verify courier, order, and product queries are scoped to current shop
- [ ] Test edge cases: deleted shops, concurrent requests, role changes
- [ ] Use Supabase dashboard Query Editor to test RLS policies manually
- [ ] Audit OTP storage — ensure codes are cleaned up after expiry

---

## Useful Files & References

**Configuration**:
- [tsconfig.json](tsconfig.json) — TypeScript strict mode, path aliases (`@/`)
- [next.config.ts](next.config.ts) — Next.js config
- [tailwind.config.ts](tailwind.config.ts) — Tailwind customization
- [.env.local](.env.local) — Supabase + Brevo secrets (local dev only)

**Project Rules**:
- [AGENTS.md](AGENTS.md) — Mandatory code generation rules
- [planning_design-doole.md](planning_design-doole.md) — Design system + component examples

**Persistent Memory** (for future Claude instances):
- [[hydration-mounted-guard]] — SSR/hydration safety
- [[supabase-migration-status]] — Current DB schema state
- [[multi_tenancy_fix]] — Multi-tenancy isolation fixes
- [[dynamization-complete]] — Dynamic content (greetings, shop names)

---

## Performance & Optimization Checklist

- **Images**: Always use `next/image` with `sizes` attribute
- **Lazy Loading**: Use `loading="lazy"` for below-the-fold images
- **Code Splitting**: Routes auto-split; use dynamic imports for heavy components
- **3G Performance**: No large fonts, minimal animations, optimized images
- **Bundle**: Avoid importing entire libraries; prefer tree-shakeable imports

---

**Last Updated**: 2026-09-18 | **Tech Stack**: Next.js 15 + Supabase + Tailwind CSS + Zod
