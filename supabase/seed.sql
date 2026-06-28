-- ============================================================
-- Doolé — Données de démonstration (optionnel)
-- ============================================================
-- À exécuter APRÈS 0001_init_schema.sql, dans l'éditeur SQL Supabase.
-- Reproduit les 4 produits, 2 livreurs et les paramètres boutique
-- qui existaient dans le prototype localStorage (src/lib/mockData.ts).
-- ============================================================

-- ---------- PRODUITS ----------
insert into public.products ("name", "description", "price", "image", "isAvailable", "stock") values
  ('Robe Wax Moderne "Fama"',
   'Robe ajustée en tissu Wax premium 100% coton, idéale pour toutes vos sorties chic et décontractées. Fabriquée à Dakar.',
   18500, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', true, 15),
  ('Boubou Bazin Riche Indigo',
   'Splendide boubou traditionnel en Bazin Riche de haute qualité, teint à la main avec de l''indigo naturel. Taille unique réglable.',
   45000, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', true, 5),
  ('Thiouraye Royal (Encens)',
   'Mélange traditionnel de bois parfumés, de résines aromatiques et d''huiles essentielles. Parfum persistant et apaisant.',
   7500, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', true, 50),
  ('Huile de Moringa Pure 100ml',
   'Huile cosmétique pressée à froid au Sénégal. Nourrit la peau et fortifie les cheveux en profondeur. Riche en antioxydants.',
   5000, 'https://images.unsplash.com/photo-1617897903246-719242758050?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', true, null);

-- ---------- LIVREURS ----------
insert into public.couriers ("name", "phone", "channel", "isDefault") values
  ('Modou Diouf',    '+221 77 123 45 67', 'whatsapp', true),
  ('Ibrahima Sow',   '+221 78 987 65 43', 'sms',      false);

-- ---------- PARAMÈTRES BOUTIQUE ----------
insert into public.shop_settings ("name", "description", "payoutPhone", "payoutProvider", "deliveryFee") values
  ('Boutique de Fatou',
   'Retrouvez le meilleur du prêt-à-porter sénégalais, des tissus wax et des accessoires de mode importés de Turquie. Livraison rapide sur Dakar sous 24h.',
   '77 123 45 67', 'wave', 1500);
