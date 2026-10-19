'use server';

import { z } from 'zod';
import { Product } from '@/types';
import { adminDb } from './server/db';
import { requireShopId, shopBySlug } from './server/access';
import { checkProductLimit } from './subscriptions';

const TABLE = 'products';

const productInputSchema = z.object({
  name: z.string().trim().min(1, 'Le nom du produit est obligatoire.'),
  description: z.string().default(''),
  price: z.coerce.number().int().min(0, 'Le prix doit être supérieur ou égal à 0.'),
  image: z.string().default(''),
  isAvailable: z.boolean().default(true),
  stock: z.coerce.number().int().min(0).nullable(),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export async function getProducts(): Promise<Product[]> {
  const shopId = await requireShopId();
  const { data, error } = await adminDb()
    .from(TABLE)
    .select('*')
    .eq('shopId', shopId)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('[products] lecture', error.message);
    throw new Error('Chargement des produits impossible.');
  }
  return (data ?? []) as Product[];
}

export async function getProductsByShopSlug(slug: string): Promise<Product[]> {
  const shop = await shopBySlug(slug);
  if (!shop) return [];

  const { data, error } = await adminDb()
    .from(TABLE)
    .select('*')
    .eq('shopId', shop.id)
    .eq('isAvailable', true)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('[products] vitrine', error.message);
    throw new Error('Chargement des produits impossible.');
  }
  return (data ?? []) as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const shopId = await requireShopId();
  const { data, error } = await adminDb()
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .eq('shopId', shopId)
    .maybeSingle();

  if (error) {
    console.error('[products] détail', error.message);
    throw new Error('Produit introuvable.');
  }
  return (data as Product | null) ?? null;
}

export async function getProductByIdAndSlug(productId: string, slug: string): Promise<Product | null> {
  const shop = await shopBySlug(slug);
  if (!shop) return null;

  const { data, error } = await adminDb()
    .from(TABLE)
    .select('*')
    .eq('id', productId)
    .eq('shopId', shop.id)
    .eq('isAvailable', true)
    .maybeSingle();

  if (error) {
    console.error('[products] fiche publique', error.message);
    throw new Error('Produit introuvable.');
  }
  return (data as Product | null) ?? null;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const parsed = productInputSchema.parse(input);
  const shopId = await requireShopId();
  await checkProductLimit(shopId);

  const { data, error } = await adminDb()
    .from(TABLE)
    .insert({ ...parsed, shopId })
    .select()
    .single();

  if (error) {
    console.error('[products] création', error.message);
    throw new Error('Création du produit échouée.');
  }
  return data as Product;
}

export async function saveProduct(product: Product): Promise<Product> {
  const parsed = productInputSchema.parse(product);
  const shopId = await requireShopId();

  const { data, error } = await adminDb()
    .from(TABLE)
    .update(parsed)
    .eq('id', product.id)
    .eq('shopId', shopId)
    .select()
    .single();

  if (error) {
    console.error('[products] mise à jour', error.message);
    throw new Error('Mise à jour du produit échouée.');
  }
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const shopId = await requireShopId();
  const { error } = await adminDb().from(TABLE).delete().eq('id', id).eq('shopId', shopId);
  if (error) {
    console.error('[products] suppression', error.message);
    throw new Error('Suppression du produit échouée.');
  }
}
