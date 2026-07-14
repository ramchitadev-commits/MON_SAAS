# ⚡ Quick Start — Multi-Tenancy Fix (TL;DR)

## 🎯 TL;DR
**Bug:** Products from shop A appearing on shop B  
**Fix:** Added slug-based shop isolation + filtering  
**Time to deploy:** ~25 minutes  

---

## 3-Step Deployment

### Step 1: Database Migration (1 min)
```sql
-- Supabase Dashboard → SQL Editor, or run via CLI:
supabase migration up

-- Copy/paste if manual:
ALTER TABLE public.shop_settings
  ADD COLUMN IF NOT EXISTS "slug" text unique;

CREATE INDEX IF NOT EXISTS idx_shop_settings_slug 
  ON public.shop_settings ("slug");
```

### Step 2: Fill Slugs for Existing Shops (5 min)
```sql
-- Supabase Dashboard → shop_settings table
-- OR SQL:

UPDATE public.shop_settings 
SET slug = 'fashion-nova' 
WHERE name = 'fashion nova';

UPDATE public.shop_settings 
SET slug = 'salikhate-nenuphar' 
WHERE name = 'SALIKHATE NENUPHAR';

-- ... repeat for each shop

-- Verify (should be 0):
SELECT COUNT(*) FROM public.shop_settings WHERE slug IS NULL;
```

### Step 3: Deploy Code & Test (5 min + 15 min testing)
```bash
# Pull the changes (already in this commit)
git pull

npm run build
npm run dev

# Test with 2 shops:
# 1. localhost:3000/fashion-nova → see ONLY fashion nova products ✅
# 2. localhost:3000/salikhate-nenuphar → see ONLY salikhate products ✅
```

---

## What Changed (Developer Perspective)

### New Imports You'll See
```typescript
// OLD (wrong):
import { getProducts } from '@/lib/products';
import { getShopSettings } from '@/lib/settings';

// NEW (correct for storefront):
import { getProductsByShopSlug } from '@/lib/products';
import { getShopSettings } from '@/lib/settings';

// Usage in [slug] routes:
getProductsByShopSlug(slug)
getShopSettings(slug)
```

### Three New Functions

#### 1. `getShopIdBySlug(slug: string): Promise<string>`
```typescript
// Converts URL slug to shop_id
const shopId = await getShopIdBySlug('salikhate-nenuphar');
// Returns: "550e8400-e29b-41d4-a716-446655440000"
```

#### 2. `getProductsByShopSlug(slug: string): Promise<Product[]>`
```typescript
// Fetches products for this shop ONLY
const products = await getProductsByShopSlug('salikhate-nenuphar');
// Returns: products of ONLY salikhate shop
```

#### 3. `getProductByIdAndSlug(productId: string, slug: string): Promise<Product | null>`
```typescript
// Validates product belongs to this shop before returning
const product = await getProductByIdAndSlug('prod-123', 'salikhate-nenuphar');
// Returns: product only if it belongs to salikhate shop
// Returns: null if product belongs to different shop (prevents URL hacking)
```

### Updated Function Signatures
```typescript
// BEFORE:
getShopSettings(): Promise<ShopSettings>

// AFTER:
getShopSettings(slug?: string): Promise<ShopSettings>
// If slug provided → gets that shop's settings
// If no slug → gets active shop (admin context)
```

---

## Critical Points

### ⚠️ MUST DO
- [ ] Apply migration (colonne `slug` doit exister)
- [ ] Fill all slugs (aucun NULL allowed)
- [ ] Test with 2+ shops before production

### ⚠️ NEVER FORGET
- [ ] Admin pages still use `getProducts()` without slug (correct)
- [ ] Storefront pages use `getProductsByShopSlug(slug)` (required)
- [ ] Don't call `getProductById()` on storefront (use `getProductByIdAndSlug()`)

### ⚠️ IF SOMETHING BREAKS
```
Error: "Aucune boutique avec le slug "xxx""
→ Slug doesn't exist in database
→ Run: UPDATE shop_settings SET slug = 'xxx' WHERE id = '...';

Error: "Foreign key constraint violation"
→ Product has invalid shopId
→ Check: SELECT * FROM products WHERE shopId IS NULL;

Error: "Cannot read property 'slug' of undefined"
→ getShopSettings() not passed slug parameter
→ Search file for getShopSettings() and add slug
```

---

## File by File Changes

| File | What Changed | Why |
|------|-------------|-----|
| `src/lib/shop.ts` | +1 new function `getShopIdBySlug()` | Convert slug → ID |
| `src/lib/products.ts` | +2 new functions, 1 renamed import | Slug-based filtering |
| `src/lib/settings.ts` | Added `slug?` param, updated type | Per-shop settings |
| `src/app/[slug]/page.tsx` | Uses `getProductsByShopSlug(slug)` | Correct filtering |
| `src/app/[slug]/p/[productId]/page.tsx` | Uses `getProductByIdAndSlug()` | Security check |
| `src/app/[slug]/livraison/page.tsx` | Passes slug to `getShopSettings()` | Correct settings |
| `supabase/migrations/0006_*` | NEW migration file | Add slug column |

---

## Testing Checklist (5 min)

```
Test 1: Basic Isolation
├─ localhost:3000/shop-1 → See shop-1 products ✅
└─ localhost:3000/shop-2 → See shop-2 products ✅

Test 2: Security
├─ localhost:3000/shop-1/p/product-from-shop-2
└─ Result: "Article introuvable" ✅

Test 3: Settings
├─ shop-1: delivery fee = 1500
├─ shop-2: delivery fee = 2500
└─ Each shows correct fee in livraison ✅

Test 4: Panier
├─ Add product from shop-1
├─ Open shop-2 in new tab
├─ Add product from shop-2
└─ Each tab has correct products (no mix) ✅
```

---

## Rollback Plan (if needed)
```bash
# If migration causes issues:
supabase migration rollback 0006_add_slug_to_shop_settings

# If code causes issues:
git revert <this-commit-hash>
npm run build && npm run deploy
```

---

## Documentation Files
- **EXECUTIVE_SUMMARY.txt** — For managers/stakeholders
- **DEPLOYMENT_CHECKLIST.md** — For DevOps/deployment
- **TEST_MULTI_TENANCY.md** — For QA/testing
- **MULTI_TENANCY_FIX.md** — For developers (technical deep-dive)
- **MULTI_TENANCY_VERIFICATION.sql** — For debugging

---

## Need Help?
1. Read the error message → 99% of time it tells you what's wrong
2. Check `MULTI_TENANCY_FIX.md` section "Vérification"
3. Run `MULTI_TENANCY_VERIFICATION.sql` queries
4. Search code for where slug is NOT being passed

---

**Status:** ✅ Ready to deploy after migration + slug fill + 15 min testing.

Tout est isolé. Produits ne vont plus se mélanger. 🎉
