'use server';

import { z } from 'zod';
import { ShopSettings } from '@/types';
import { adminDb } from './server/db';
import { requireShopId } from './server/access';
import { getSellerPhone, requireSellerPhone } from './session';

const TABLE = 'shop_settings';
const BUCKET = 'shop-logos';

const shopSettingsSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Le slug doit contenir uniquement des lettres, chiffres et tirets')
    .min(1, 'Le slug est obligatoire.')
    .optional(),
  name: z.string().trim().min(1, 'Le nom de la boutique est obligatoire.'),
  description: z.string().default(''),
  payoutPhone: z.string().trim().min(1, 'Le numéro de réception est obligatoire.'),
  payoutProvider: z.enum(['wave', 'orange_money']),
  deliveryFee: z.number().int().min(0),
  logo: z.string().nullable().optional(),
  cutoffTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format invalide').nullable().optional(),
  sellerName: z.string().trim().default('Cher partenaire'),
  sellerPhone: z.string().nullable().optional(),
  sellerEmail: z.string().email().nullable().optional(),
});

function toSettings(row: Record<string, unknown>): ShopSettings {
  return {
    id: row.id as string,
    slug: (row.slug as string) || undefined,
    name: row.name as string,
    description: row.description as string,
    payoutPhone: row.payoutPhone as string,
    payoutProvider: row.payoutProvider as 'wave' | 'orange_money',
    deliveryFee: row.deliveryFee as number,
    logo: (row.logo as string) || null,
    cutoffTime: (row.cutoffTime as string) || '18:00',
    sellerName: (row.sellerName as string) || 'Cher partenaire',
    sellerPhone: (row.sellerPhone as string) || null,
    sellerEmail: (row.sellerEmail as string) || null,
  };
}

function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30) || 'boutique'
  );
}

export async function sellerHasShop(): Promise<boolean> {
  const phone = await getSellerPhone();
  if (!phone) return false;
  const { data, error } = await adminDb()
    .from(TABLE)
    .select('id')
    .eq('sellerPhone', phone)
    .maybeSingle();
  if (error) {
    console.error('[settings] existence', error.message);
    throw new Error('Chargement de la boutique impossible.');
  }
  return Boolean(data);
}

export async function getShopSettings(slug?: string): Promise<ShopSettings> {
  if (slug) {
    const { data, error } = await adminDb().from(TABLE).select('*').eq('slug', slug).maybeSingle();
    if (error) {
      console.error('[settings] vitrine', error.message);
      throw new Error('Chargement de la boutique impossible.');
    }
    if (!data) throw new Error('Boutique introuvable.');
    return toSettings(data);
  }

  const phone = await requireSellerPhone();
  const { data, error } = await adminDb()
    .from(TABLE)
    .select('*')
    .eq('sellerPhone', phone)
    .maybeSingle();

  if (error) {
    console.error('[settings] vendeur', error.message);
    throw new Error('Chargement de la boutique impossible.');
  }
  if (!data) throw new Error("Aucune boutique créée. Complétez d'abord l'onboarding.");
  return toSettings(data);
}

export async function uploadLogo(file: File): Promise<string> {
  const shopId = await requireShopId();
  if (!file.type.startsWith('image/')) throw new Error('Le logo doit être une image.');
  if (file.size > 2 * 1024 * 1024) throw new Error('Image trop lourde (2 Mo maximum).');

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${shopId}/logo-${Date.now()}.${ext}`;
  const db = adminDb();

  const { data, error } = await db.storage.from(BUCKET).upload(path, file, { upsert: true });
  if (error) {
    console.error('[settings] logo', error.message);
    throw new Error('Upload du logo échoué.');
  }

  const { data: publicUrl } = db.storage.from(BUCKET).getPublicUrl(data.path);
  return publicUrl.publicUrl;
}

export async function saveShopSettings(settings: ShopSettings): Promise<ShopSettings> {
  const parsed = shopSettingsSchema.parse(settings);
  const sellerPhone = await requireSellerPhone();
  const db = adminDb();

  const { data: existing, error: selError } = await db
    .from(TABLE)
    .select('id, slug')
    .eq('sellerPhone', sellerPhone)
    .maybeSingle();

  if (selError) {
    console.error('[settings] lecture', selError.message);
    throw new Error('Lecture de la boutique impossible.');
  }

  const dataToSave = {
    ...parsed,
    slug: parsed.slug || (existing?.slug as string | undefined) || generateSlug(parsed.name),
    sellerPhone,
    sellerEmail: null,
  };

  if (existing) {
    const { data, error } = await db
      .from(TABLE)
      .update(dataToSave)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) {
      console.error('[settings] mise à jour', error.message);
      throw new Error(
        error.code === '23505' ? 'Ce lien de boutique est déjà pris.' : 'Mise à jour de la boutique échouée.'
      );
    }
    return toSettings(data);
  }

  const { data, error } = await db.from(TABLE).insert(dataToSave).select().single();
  if (error) {
    console.error('[settings] création', error.message);
    throw new Error(
      error.code === '23505' ? 'Ce lien de boutique est déjà pris.' : 'Création de la boutique échouée.'
    );
  }
  return toSettings(data);
}
