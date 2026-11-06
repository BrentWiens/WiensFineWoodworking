'use server';

import { redirect } from 'next/navigation';
import { deleteSession } from '@/lib/auth/dal';

export async function signOut(): Promise<void> {
  await deleteSession();
  redirect('/tools');
}
