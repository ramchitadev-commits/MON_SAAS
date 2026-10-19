export const DAKAR_ZONES = [
  { name: 'Mermoz', fee: 1500 },
  { name: 'Plateau', fee: 1500 },
  { name: 'Amitié / Fann / Point E', fee: 1500 },
  { name: 'Almadies', fee: 2000 },
  { name: 'Ouakam / Mamelles', fee: 1500 },
  { name: 'Yoff / Ngor', fee: 2000 },
  { name: 'Parcelles Assainies', fee: 2000 },
  { name: 'Guédiawaye', fee: 2500 },
  { name: 'Pikine', fee: 2500 },
  { name: 'Rufisque', fee: 3500 },
] as const;

export function feeForZone(zone: string): number | null {
  const match = DAKAR_ZONES.find((item) => item.name === zone);
  return match ? match.fee : null;
}
