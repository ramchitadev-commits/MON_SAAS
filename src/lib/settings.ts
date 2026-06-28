import { z } from 'zod';
import { supabase } from './supabase';

const TABLE = 'shop_settings';

export interface ShopSettings {
  name: string;
  description: string;
  payoutPhone: string;
  payoutProvider: 'wave' | 'orange_money';
  deliveryFee: number;
}

// Valeurs de repli si aucune ligne n'existe encore en base.
export const DEFAULT_SETTINGS: ShopSettings = {
  name: 'Boutique de Fatou',
  description:
    'Retrouvez le meilleur du prêt-à-porter sénégalais, des tissus wax et des accessoires de mode importés de Turquie. Livraison rapide sur Dakar sous 24h.',
  payoutPhone: '77 123 45 67',
  payoutProvider: 'wave',
  deliveryFee: 1500,
};

// --- Validation Zod (règle AGENTS.md) ---
export const shopSettingsSchema = z.object({
  name: z.string().trim().min(1, 'Le nom de la boutique est obligatoire.'),
  description: z.string().default(''),
  payoutPhone: z.string().trim().min(1, 'Le numéro de réception est obligatoire.'),
  payoutProvider: z.enum(['wave', 'orange_money']),
  deliveryFee: z.number().int().min(0),
});

// On ne renvoie que les champs métier (pas l'id/createdAt techniques).
function toSettings(row: Record<string, unknown>): ShopSettings {
  return {
    name: row.name as string,
    description: row.description as string,
    payoutPhone: row.payoutPhone as string,
    payoutProvider: row.payoutProvider as 'wave' | 'orange_money',
    deliveryFee: row.deliveryFee as number,
  };
}

export async function getShopSettings(): Promise<ShopSettings> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('createdAt', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Chargement des paramètres impossible : ${error.message}`);
  return data ? toSettings(data) : DEFAULT_SETTINGS;
}

// Table mono-ligne pour le prototype : on met à jour la ligne existante, sinon on la crée.
export async function saveShopSettings(settings: ShopSettings): Promise<ShopSettings> {
  const parsed = shopSettingsSchema.parse(settings);

  const { data: existing, error: selError } = await supabase
    .from(TABLE)
    .select('id')
    .order('createdAt', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (selError) throw new Error(`Lecture des paramètres impossible : ${selError.message}`);

  if (existing) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(parsed)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw new Error(`Enregistrement des paramètres échoué : ${error.message}`);
    return toSettings(data);
  }

  const { data, error } = await supabase.from(TABLE).insert(parsed).select().single();
  if (error) throw new Error(`Création des paramètres échouée : ${error.message}`);
  return toSettings(data);
}
