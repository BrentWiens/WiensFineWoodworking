import { existsSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit doesn't read Next's env files. `vercel env pull .env.local` writes
// DATABASE_URL there, so load it when present (an exported DATABASE_URL wins).
if (!process.env.DATABASE_URL && existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
}

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  strict: true,
});
