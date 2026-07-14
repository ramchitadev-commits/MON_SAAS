# 🧪 Guide de Test — Multi-Tenancy Isolation

## Test Rapide (5 minutes)

### Prérequis
- [ ] Migration appliquée (colonne `slug` existe)
- [ ] Code déployé localement (`npm run dev`)
- [ ] 2 boutiques créées avec slugs uniques

### Scénario de Test

#### Test 1 : Affichage des Produits (Isolation Basic)
```
1. Accéder à : http://localhost:3000/boutique-1
2. Vérifier : Affiche UNIQUEMENT les produits de boutique-1 ✅
3. Ouvrir Dev Tools (F12) → Network → Chercher appel getProductsByShopSlug
4. Vérifier que la requête Supabase filtre par shopId correct

5. Accéder à : http://localhost:3000/boutique-2
6. Vérifier : Affiche UNIQUEMENT les produits de boutique-2 ✅
7. Comparer avec étape 2 → Les produits sont différents ✅
```

**Résultat attendu :** Les produits ne se mélangent pas

---

#### Test 2 : Tentative de Contournement (Sécurité)
```
1. Identifier un produit de boutique-2
   - Nom: "Sac à main Tissu Wax", ID: "prod-xyz"
   
2. Accéder directement à la page produit depuis boutique-1 :
   http://localhost:3000/boutique-1/p/prod-xyz

3. Vérifier : Page affiche "Article introuvable" ✅
   (le produit ne doit PAS s'afficher car il appartient à boutique-2)
```

**Résultat attendu :** Impossible d'accéder aux produits d'une autre boutique

---

#### Test 3 : Paramètres de Boutique (Settings Isolation)
```
1. Boutique-1 : Modifier delivery fee → 1500 FCFA
2. Boutique-2 : Modifier delivery fee → 2500 FCFA
3. Accéder au panier (livraison) de boutique-1 → Affiche 1500 ✅
4. Accéder au panier (livraison) de boutique-2 → Affiche 2500 ✅
```

**Résultat attendu :** Chaque boutique a ses propres paramètres

---

#### Test 4 : Panier & Checkout (End-to-End)
```
1. Ajouter produit-A (de boutique-1) au panier
2. Accéder à /boutique-1/panier → Affiche produit-A ✅
3. Continuer vers livraison/paiement
4. Vérifier que cutoff time, fee et settings = boutique-1 ✅

5. Ouvrir NEW tab et aller sur boutique-2
6. Ajouter produit-B (de boutique-2) au panier
7. Accéder à /boutique-2/panier → Affiche produit-B (PAS produit-A) ✅
8. Les paniers sont isolés ✅
```

**Résultat attendu :** Panier isolé par boutique (même navigateur, pas de mélange)

---

## Test Approfondi (15 minutes)

### Via Supabase Console
```sql
-- Exécutez cette requête dans le dashboard Supabase → SQL Editor

-- 1. Vérifier les slugs
SELECT id, name, slug FROM public.shop_settings;
-- ✅ Tous les slugs doivent être uniques et remplis

-- 2. Vérifier les produits par boutique
SELECT 
  s.slug as shop_slug,
  COUNT(p.id) as product_count
FROM public.shop_settings s
LEFT JOIN public.products p ON s.id = p."shopId"
GROUP BY s.id, s.slug;
-- ✅ Chaque boutique doit avoir sa propre liste

-- 3. Vérifier isolation (simulation requête app)
SELECT p.* 
FROM public.products p
WHERE p."shopId" = (
  SELECT id FROM public.shop_settings WHERE slug = 'boutique-1'
)
AND p."isAvailable" = true;
-- ✅ Doit retourner UNIQUEMENT les produits de boutique-1
```

---

## Test de Performance

```
1. Ouvrir Dev Tools → Performance tab
2. Accéder à /boutique-1
3. Vérifier que getShopSettings() et getProductsByShopSlug() se terminent en < 500ms
4. Ouvrir la vue réseau → Pas de requête inutile vers d'autres boutiques
```

**Résultat attendu :** Requêtes rapides et efficaces

---

## Checklist de Validation Finale

- [ ] Produits n'apparaissent que sur la bonne boutique
- [ ] Impossible d'accéder aux produits d'une autre boutique via URL
- [ ] Paramètres (fee, cutoff) sont isolés par boutique
- [ ] Panier est isolé par boutique
- [ ] Requêtes Supabase sont correctement filtrées
- [ ] Pas d'erreur console (F12)
- [ ] Performance acceptable (< 500ms par requête)

---

## En cas de Problème

### Problème : "Les produits se mélangent"
```
Debug :
1. F12 → Console → Voir l'erreur exacte
2. F12 → Network → Vérifier la requête getProductsByShopSlug
3. Supabase Dashboard → SQL Editor → Exécuter
   SELECT p.id, p.name, p."shopId", s.slug FROM products p
   LEFT JOIN shop_settings s ON p."shopId" = s.id;
4. Vérifier que les shopId sont corrects
```

### Problème : "TypeError: Cannot read property 'slug' of undefined"
```
La migration n'a pas été appliquée. Faire :
1. Supabase → SQL Editor
2. Exécuter : SELECT "slug" FROM shop_settings LIMIT 1;
3. Si erreur "column does not exist" → Exécuter 0006_add_slug_to_shop_settings.sql
```

### Problème : "Boutique non trouvée"
```
Le slug n'existe pas pour cette boutique.
1. Vérifier les slugs : SELECT slug FROM shop_settings;
2. Ajouter le slug manquant : UPDATE shop_settings SET slug = 'nom' WHERE id = '...';
3. Recharger la page
```

---

## Signoff

Quand tout est ✅ :

**Multi-tenancy isolation CERTIFIÉE** — Les données sont 100% isolées entre les boutiques.

Prêt à déployer en production.
