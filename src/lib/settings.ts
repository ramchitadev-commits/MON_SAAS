import { z } from 'zod';
import { supabase } from './supabase';
import { getAuthPhone, getAuthEmail } from './auth';

const TABLE = 'shop_settings';
const BUCKET = 'shop-logos';

export interface ShopSettings {
  id?: string; // ID Supabase (needed for some queries)
  slug?: string; // URL-friendly identifier (ex: "salikhate-nenuphar")
  name: string;
  description: string;
  payoutPhone: string;
  payoutProvider: 'wave' | 'orange_money';
  deliveryFee: number;
  logo?: string | null;
  cutoffTime?: string | null; // HH:MM format, ex: "16:30"
  sellerName?: string; // Prénom du vendeur pour le greeting
  sellerPhone?: string | null; // Téléphone du vendeur propriétaire (multi-tenancy)
  sellerEmail?: string | null; // Email du vendeur propriétaire (multi-tenancy)
}

// Valeurs de repli si aucune ligne n'existe encore en base.
export const DEFAULT_SETTINGS: ShopSettings = {
  slug: 'boutique-demo',
  name: 'Boutique de Fatou',
  description:
    'Retrouvez le meilleur du prêt-à-porter sénégalais, des tissus wax et des accessoires de mode importés de Turquie. Livraison rapide sur Dakar sous 24h.',
  payoutPhone: '77 123 45 67',
  payoutProvider: 'wave',
  deliveryFee: 1500,
  logo: null,
  cutoffTime: '18:00',
  sellerName: 'Cher partenaire',
};

// --- Validation Zod (règle AGENTS.md) ---
export const shopSettingsSchema = z.object({
  slug: z.string().trim().toLowerCase()
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

// Transforme une ligne Supabase en objet ShopSettings
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

// Récupère la boutique du vendeur authentifié
// Si slug est fourni, récupère la boutique publique (pour la storefront)
// Sinon récupère la boutique du vendeur connecté
export async function getShopSettings(slug?: string): Promise<ShopSettings> {
  // Si slug fourni : récupère la boutique publique par slug (pour les clients)
  if (slug) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw new Error(`Chargement de la boutique impossible : ${error.message}`);
    if (!data) return DEFAULT_SETTINGS;
    return toSettings(data);
  }

  // Sinon : récupère la boutique du vendeur connecté (pour le dashboard)
  const sellerPhone = getAuthPhone();
  const sellerEmail = getAuthEmail();

  if (!sellerPhone && !sellerEmail) {
    return DEFAULT_SETTINGS;
  }

  let query = supabase.from(TABLE).select('*');

  if (sellerEmail) {
    query = query.eq('sellerEmail', sellerEmail);
  } else if (sellerPhone) {
    query = query.eq('sellerPhone', sellerPhone);
  }

  const { data, error } = await query.maybeSingle();

  if (error) throw new Error(`Chargement de la boutique impossible : ${error.message}`);
  if (!data) throw new Error('Aucune boutique créée. Complétez d\'abord l\'onboarding.');
  return toSettings(data);
}

// Upload un logo dans Supabase Storage et retourne l'URL publique.
export async function uploadLogo(file: File): Promise<string> {
  const timestamp = Date.now();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `logo-${timestamp}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (error) throw new Error(`Upload du logo échoué : ${error.message}`);

  const { data: publicUrl } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return publicUrl.publicUrl;
}

// Génère un slug à partir du nom de la boutique
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30) || 'boutique';
}

// Crée ou met à jour la boutique du vendeur authentifié
// Support multi-tenancy : chaque vendeur n'a qu'une boutique
export async function saveShopSettings(settings: ShopSettings): Promise<ShopSettings> {
  const parsed = shopSettingsSchema.parse(settings);

  const sellerPhone = getAuthPhone();
  const sellerEmail = getAuthEmail();

  if (!sellerPhone && !sellerEmail) {
    throw new Error('Aucun utilisateur authentifié. Veuillez vous connecter.');
  }

  // Ajouter les infos du vendeur aux données à sauvegarder
  const dataToSave = {
    ...parsed,
    slug: parsed.slug || generateSlug(parsed.name),
    sellerPhone: sellerPhone || null,
    sellerEmail: sellerEmail || null,
  };

  // Vérifier si cette boutique existe déjà pour ce vendeur
  let query = supabase.from(TABLE).select('id');
  if (sellerEmail) {
    query = query.eq('sellerEmail', sellerEmail);
  } else if (sellerPhone) {
    query = query.eq('sellerPhone', sellerPhone);
  }

  const { data: existing, error: selError } = await query.maybeSingle();
  if (selError) throw new Error(`Lecture de la boutique impossible : ${selError.message}`);

  if (existing) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(dataToSave)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw new Error(`Mise à jour de la boutique échouée : ${error.message}`);
    return toSettings(data);
  }

  const { data, error } = await supabase.from(TABLE).insert(dataToSave).select().single();
  if (error) throw new Error(`Création de la boutique échouée : ${error.message}`);
  return toSettings(data);
}