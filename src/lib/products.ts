import { z } from 'zod';
import { supabase } from './supabase';
import { Product } from '@/types';
import { getActiveShopId, getShopIdBySlug } from './shop';

const TABLE = 'products';

// --- Validation Zod : toute donnée entrante est validée (règle AGENTS.md) ---
// On ne valide que les champs modifiables. `id` et `createdAt` sont gérés par Supabase.
export const productInputSchema = z.object({
  name: z.string().trim().min(1, 'Le nom du produit est obligatoire.'),
  description: z.string().default(''),
  price: z.number().int('Le prix doit être un entier.').min(0, 'Le prix doit être positif.'),
  image: z.string().default(''),
  isAvailable: z.boolean().default(true),
  stock: z.number().int().min(0).nullable(), // null = stock illimité
});

export type ProductInput = z.infer<typeof productInputSchema>;

// --- Lecture ---
// Pour le dashboard admin (contexte authentifié) : récupère les produits de la boutique actuelle
export async function getProducts(): Promise<Product[]> {
  try {
    const shopId = await getActiveShopId();
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('shopId', shopId)
      .order('createdAt', { ascending: false });

    if (error) throw new Error(`Chargement des produits impossible : ${error.message}`);
    return (data ?? []) as Product[];
  } catch (err) {
    console.error('Erreur getProducts:', err);
    return [];
  }
}

// Pour la storefront publique : récupère les produits d'une boutique par son slug
export async function getProductsByShopSlug(slug: string): Promise<Product[]> {
  try {
    const shopId = await getShopIdBySlug(slug);
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('shopId', shopId)
      .eq('isAvailable', true)
      .order('createdAt', { ascending: false });

    if (error) throw new Error(`Chargement des produits impossible : ${error.message}`);
    return (data ?? []) as Product[];
  } catch (err) {
    console.error('Erreur getProductsByShopSlug:', err);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Produit introuvable : ${error.message}`);
  return (data as Product | null) ?? null;
}

// Récupère un produit spécifique d'une boutique (pour la storefront publique)
export async function getProductByIdAndSlug(
  productId: string,
  slug: string
): Promise<Product | null> {
  try {
    const shopId = await getShopIdBySlug(slug);
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', productId)
      .eq('shopId', shopId)
      .maybeSingle();

    if (error) throw new Error(`Produit introuvable : ${error.message}`);
    return (data as Product | null) ?? null;
  } catch (err) {
    console.error('Erreur getProductByIdAndSlug:', err);
    return null;
  }
}

// --- Création (nouveau produit : Supabase génère l'id et createdAt) ---
export async function createProduct(input: ProductInput): Promise<Product> {
  const parsed = productInputSchema.parse(input);
  const shopId = await getActiveShopId();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...parsed, shopId })
    .select()
    .single();

  if (error) throw new Error(`Création du produit échouée : ${error.message}`);
  return data as Product;
}

// --- Mise à jour d'un produit existant (par son id UUID) ---
export async function saveProduct(product: Product): Promise<Product> {
  // parse() retire au passage les champs non modifiables (id, createdAt).
  const parsed = productInputSchema.parse(product);

  const { data, error } = await supabase
    .from(TABLE)
    .update(parsed)
    .eq('id', product.id)
    .select()
    .single();

  if (error) throw new Error(`Mise à jour du produit échouée : ${error.message}`);
  return data as Product;
}

// --- Suppression ---
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(`Suppression du produit échouée : ${error.message}`);
}
