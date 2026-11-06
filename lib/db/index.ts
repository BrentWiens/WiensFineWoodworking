import 'server-only';
import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let instance: NeonHttpDatabase<typeof schema> | undefined;

/**
 * Created on first use rather than at import time, so `next build` and CI — which
 * never touch the database — don't need DATABASE_URL set.
 *
 * Don't import this from pages or actions directly: go through a data-access module
 * (e.g. lib/mileage/data.ts) whose every function checks the session first.
 */
export function db(): NeonHttpDatabase<typeof schema> {
  if (!instance) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    instance = drizzle(neon(url), { schema });
  }
  return instance;
}
