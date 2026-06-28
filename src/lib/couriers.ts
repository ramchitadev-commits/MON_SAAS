import { z } from 'zod';
import { supabase } from './supabase';
import { Courier } from '@/types';

const TABLE = 'couriers';

// --- Validation Zod (règle AGENTS.md) ---
export const courierInputSchema = z.object({
  name: z.string().trim().min(1, 'Le nom du livreur est obligatoire.'),
  phone: z.string().trim().min(1, 'Le téléphone du livreur est obligatoire.'),
  channel: z.enum(['sms', 'whatsapp']),
  isDefault: z.boolean().default(false),
});

export type CourierInput = z.infer<typeof courierInputSchema>;

// Retire le statut « par défaut » de tous les livreurs (sauf un éventuel exclu).
async function clearDefault(exceptId?: string): Promise<void> {
  let query = supabase.from(TABLE).update({ isDefault: false }).eq('isDefault', true);
  if (exceptId) query = query.neq('id', exceptId);
  const { error } = await query;
  if (error) throw new Error(`Mise à jour du livreur par défaut échouée : ${error.message}`);
}

export async function getCouriers(): Promise<Courier[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('createdAt', { ascending: true });

  if (error) throw new Error(`Chargement des livreurs impossible : ${error.message}`);
  return (data ?? []) as Courier[];
}

export async function createCourier(input: CourierInput): Promise<Courier> {
  const parsed = courierInputSchema.parse(input);

  // Le tout premier livreur devient automatiquement le livreur par défaut.
  let makeDefault = parsed.isDefault;
  if (!makeDefault) {
    const { count } = await supabase.from(TABLE).select('id', { count: 'exact', head: true });
    makeDefault = (count ?? 0) === 0;
  }
  if (makeDefault) await clearDefault();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...parsed, isDefault: makeDefault })
    .select()
    .single();

  if (error) throw new Error(`Création du livreur échouée : ${error.message}`);
  return data as Courier;
}

export async function saveCourier(courier: Courier): Promise<Courier> {
  const parsed = courierInputSchema.parse(courier);
  if (parsed.isDefault) await clearDefault(courier.id);

  const { data, error } = await supabase
    .from(TABLE)
    .update(parsed)
    .eq('id', courier.id)
    .select()
    .single();

  if (error) throw new Error(`Mise à jour du livreur échouée : ${error.message}`);
  return data as Courier;
}

// Définit un livreur comme « par défaut » et retire ce statut aux autres.
export async function setDefaultCourier(id: string): Promise<void> {
  await clearDefault(id);
  const { error } = await supabase.from(TABLE).update({ isDefault: true }).eq('id', id);
  if (error) throw new Error(`Définition du livreur par défaut échouée : ${error.message}`);
}

export async function deleteCourier(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(`Suppression du livreur échouée : ${error.message}`);
}
