-- ============================================================
-- Vérification de la Structure Multi-Tenancy
-- Exécutez ce script pour vérifier que l'isolation est correcte
-- ============================================================

-- 1. Vérifier que la colonne slug existe et est unique
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'shop_settings' AND column_name = 'slug';

-- 2. Vérifier que l'index sur slug existe
SELECT indexname FROM pg_indexes
WHERE tablename = 'shop_settings' AND indexname LIKE '%slug%';

-- 3. Vérifier que les boutiques ont toutes un slug unique
SELECT id, name, slug FROM public.shop_settings;

-- ❌ Si vous voyez des slugs NULL ou DUPLIQUÉS, remplissez-les :
-- UPDATE public.shop_settings
-- SET slug = LOWER(REPLACE(name, ' ', '-'))
-- WHERE slug IS NULL;

-- 4. Vérifier que les produits ont tous un shopId
SELECT COUNT(*) as total_products, COUNT(DISTINCT "shopId") as shops_with_products
FROM public.products;

-- 5. Vérifier que chaque produit est lié à une boutique
SELECT p."id" as product_id, p."name", s."name" as shop_name, p."shopId"
FROM public.products p
LEFT JOIN public.shop_settings s ON p."shopId" = s."id"
LIMIT 10;

-- 6. Test d'isolation : Produits par boutique
SELECT s."name" as boutique, COUNT(p."id") as nombre_produits
FROM public.shop_settings s
LEFT JOIN public.products p ON s."id" = p."shopId"
GROUP BY s."id", s."name";

-- 7. Vérifier les contraintes de clés étrangères
SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name
FROM information_schema.referential_constraints
WHERE table_name = 'products';

-- ============================================================
-- TESTS D'ISOLATION (à exécuter après création de test data)
-- ============================================================

-- Test 1: Récupérer les produits d'une boutique par son slug
-- SELECT p.* FROM public.products p
-- INNER JOIN public.shop_settings s ON p."shopId" = s."id"
-- WHERE s.slug = 'salikhate-nenuphar'
-- AND p."isAvailable" = true;

-- Test 2: Vérifier qu'on ne récupère PAS les produits d'une autre boutique
-- SELECT COUNT(*) FROM public.products p
-- INNER JOIN public.shop_settings s ON p."shopId" = s."id"
-- WHERE s.slug = 'salikhate-nenuphar'
-- AND p."shopId" NOT IN (
--   SELECT id FROM public.shop_settings WHERE slug = 'salikhate-nenuphar'
-- );
-- -- ✅ Résultat : 0 (aucun produit ne doit s'afficher)

-- ============================================================
-- NETTOYAGE (en cas de problème)
-- ============================================================

-- ⚠️ SEULEMENT SI NÉCESSAIRE : Réinitialiser les slugs
-- UPDATE public.shop_settings
-- SET slug = NULL
-- WHERE true;

-- Puis les regénérer avec des noms corrects
-- UPDATE public.shop_settings
-- SET slug = 'fashion-nova'
-- WHERE name LIKE '%fashion%';
