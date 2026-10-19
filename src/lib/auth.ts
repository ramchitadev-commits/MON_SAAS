'use server';

import { clearSellerSession } from './session';

export async function logout(): Promise<void> {
  await clearSellerSession();
}
