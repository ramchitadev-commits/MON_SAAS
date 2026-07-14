# ✅ Checklist de Déploiement — Multi-Tenancy Fix

## 🚀 AVANT de déployer en production

### Étape 1 : Migration Supabase
- [ ] **Appliquer la migration** `0006_add_slug_to_shop_settings.sql`
  ```bash
  supabase migration up
  # OU via le dashboard Supabase : exécutez le SQL manuellement
  ```
- [ ] Vérifier que la colonne `slug` existe dans `shop_settings`
  ```sql
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'shop_settings' AND column_name = 'slug';
  ```

### Étape 2 : Remplir les slugs pour les boutiques existantes
- [ ] Générer des slugs uniques pour chaque boutique existante
  ```sql
  -- Exemple : générer des slugs à partir des noms existants
  UPDATE public.shop_settings 
  SET slug = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), 'é', 'e'), 'à', 'a'))
  WHERE slug IS NULL;
  ```
- [ ] **Ou manuellement :** Remplir chaque slug sur le dashboard Supabase
  - Boutique "fashion nova" → slug: `fashion-nova`
  - Boutique "SALIKHATE NENUPHAR" → slug: `salikhate-nenuphar`
  - Boutique "LA DIVA COLLECTION" → slug: `la-diva-collection`
  - Etc.

- [ ] Vérifier que tous les slugs sont uniques
  ```sql
  SELECT slug, COUNT(*) FROM public.shop_settings GROUP BY slug HAVING COUNT(*) > 1;
  -- ✅ Résultat attendu : aucune ligne
  ```

### Étape 3 : Vérifier la structure des produits
- [ ] Tous les produits ont un `shopId` valide
  ```sql
  SELECT COUNT(*) FROM public.products WHERE "shopId" IS NULL;
  -- ✅ Résultat attendu : 0
  ```
- [ ] Vérifier la FK vers `shop_settings`
  ```sql
  SELECT constraint_name FROM information_schema.referential_constraints 
  WHERE table_name = 'products' AND column_name = 'shopId';
  ```

### Étape 4 : Déployer le code
- [ ] Pull les changements du code :
  - `src/lib/shop.ts` — Nouvelles fonctions `getShopIdBySlug()`
  - `src/lib/products.ts` — Nouvelles fonctions `getProductsByShopSlug()` et `getProductByIdAndSlug()`
  - `src/lib/settings.ts` — Param `slug` dans `getShopSettings()`
  - `src/app/[slug]/page.tsx` — Utilise `getProductsByShopSlug(slug)`
  - `src/app/[slug]/p/[productId]/page.tsx` — Utilise `getProductByIdAndSlug(productId, slug)`
  - `src/app/[slug]/livraison/page.tsx` — Appel avec `getShopSettings(slug)`

- [ ] Compiler et tester localement
  ```bash
  npm run build
  npm run dev
  ```

### Étape 5 : Tests Fonctionnels
- [ ] **Test 1 : Multi-shop isolation**
  - Créer 2 boutiques avec des slugs différents
  - Ajouter des produits **DIFFÉRENTS** à chacune
  - Accéder à `http://localhost:3000/boutique-1` → Vérifier qu'on voit **UNIQUEMENT** ses produits
  - Accéder à `http://localhost:3000/boutique-2` → Vérifier qu'on voit **UNIQUEMENT** ses produits
  - ✅ **Succès :** Les produits de boutique-1 n'apparaissent PAS sur boutique-2

- [ ] **Test 2 : Sécurité (tentative d'accès cross-shop)**
  - Avoir 2 produits : `prod-A` (dans boutique-1) et `prod-B` (dans boutique-2)
  - Accéder à `http://localhost:3000/boutique-1/p/prod-B` (produit d'une autre boutique)
  - ✅ **Succès :** "Article introuvable" (le produit ne s'affiche PAS)

- [ ] **Test 3 : Dashboard vendeur**
  - Chaque vendeur ne voit QUE ses produits dans "Mon Catalogue"
  - Les commandes affichées appartiennent à SA boutique

- [ ] **Test 4 : Panier & checkout**
  - Ajouter au panier depuis une boutique
  - Vérifier que les paramètres de livraison/paiement utilisent la bonne boutique

### Étape 6 : Monitoring Post-Déploiement
- [ ] Surveiller les logs Supabase pour erreurs d'intégrité
  - Rechercher les erreurs "Foreign key violation"
  - Rechercher les requêtes `shopId IS NULL`

- [ ] Vérifier que les nouvelles boutiques ont bien un slug unique
  - Mettre à jour le formulaire d'onboarding si nécessaire

---

## ⚠️ Points Critiques

| Aspect | Risque | Mitigation |
|--------|--------|-----------|
| **Slugs manquants** | Les boutiques sans slug ne s'affichent pas | Vérifier tous les slugs en prod, mettre à jour avant déploiement |
| **shopId NULL** | Produits orphelins, isolation échouée | Requête de vérification dans étape 3 |
| **RLS policies** | Autres utilisateurs peuvent accéder aux données | TODO : Renforcer les policies avant prod (actuellement en "all access") |
| **URL avec ancien système** | Liens cassés | Vérifier que tous les [slug] sont mappés correctement |

---

## 📊 Vérifications SQL Post-Déploiement

```sql
-- Exécutez ces requêtes après déploiement pour certifier l'isolation
SELECT 'VERIFICATION MULTI-TENANCY' as status;

-- 1. Tous les slugs uniques ?
SELECT COUNT(DISTINCT slug) as unique_slugs, COUNT(*) as total_shops 
FROM public.shop_settings;

-- 2. Tous les produits liés à une boutique ?
SELECT COUNT(*) as total, 
       COUNT("shopId") as with_shopid,
       COUNT(*) - COUNT("shopId") as orphans
FROM public.products;

-- 3. Produits correctement isolés ?
SELECT s.slug, COUNT(p.id) as product_count
FROM public.shop_settings s
LEFT JOIN public.products p ON s.id = p."shopId"
GROUP BY s.id, s.slug
ORDER BY product_count DESC;
```

---

## 🔐 Sécurité : TODO Post-MVP

Avant de vraiment commercialiser, appliquer ces renforcements :

```sql
-- 1. RLS : Chaque boutique accède uniquement à ses propres données
CREATE POLICY "shop_isolation" ON public.products
  FOR SELECT USING (
    "shopId" IN (SELECT id FROM public.shop_settings)
  );

-- 2. Authentification Supabase par shop
-- → Ajouter user_id dans shop_settings
-- → Vérifier que auth.uid() == shop.user_id

-- 3. Audit : Tracer qui a modifié quoi
-- → Ajouter des colonnes updated_by, updated_at
-- → Logger les suppressions
```

---

## ✅ Checklist Finale

Avant le **go live** :

- [ ] Migration appliquée ✅
- [ ] Slugs générés pour toutes les boutiques ✅
- [ ] Code déployé ✅
- [ ] Tests fonctionnels passés ✅
- [ ] Logs Supabase clean (pas d'erreurs) ✅
- [ ] Performance acceptable (requêtes < 500ms) ✅
- [ ] Documentation mise à jour ✅

---

## 🆘 En cas de Problème

### "Les produits se mélangent toujours"
```sql
-- Vérifier les shopId des produits
SELECT p.id, p.name, p."shopId", s.slug 
FROM public.products p
LEFT JOIN public.shop_settings s ON p."shopId" = s.id
LIMIT 5;

-- Remplir les shopId manquants manuellement (DANGEREUX, faire avec prudence)
-- Identifier d'abord quelle boutique chaque produit appartient
```

### "TypeError: Cannot read property 'slug' of undefined"
- Le slug n'est pas passé à `getShopSettings()`
- Vérifier que tous les appels dans `[slug]/` pages passent le slug

### "Foreign key constraint violation"
- Un produit a un `shopId` qui n'existe pas
- Corriger : `UPDATE products SET shopId = 'valid-uuid' WHERE shopId IS NULL OR shopId NOT IN (SELECT id FROM shop_settings)`

---

**Status:** ✅ Prêt à déployer après vérification des étapes ci-dessus.
