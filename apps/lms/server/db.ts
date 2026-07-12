import { drizzle as drizzleNeon, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be provided');
}

const url = new URL(process.env.DATABASE_URL);
const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1';

// Neon's serverless driver speaks Neon's HTTP proxy protocol and cannot reach
// a plain local Postgres. Local development/runtime-verification uses
// node-postgres; production (Neon) keeps the serverless driver. The choice is
// logged at boot so the runtime configuration is never ambiguous. Both drivers
// expose the same drizzle query API for this schema.
type Db = NeonHttpDatabase<typeof schema>;

function createDb(): Db {
  if (isLocal) {
    console.log(`[db] driver=node-postgres host=${url.hostname} (local verification mode)`);
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    return drizzlePg(pool, { schema }) as unknown as Db;
  }
  console.log(`[db] driver=neon-http host=${url.hostname}`);
  return drizzleNeon(neon(process.env.DATABASE_URL!), { schema });
}

export const db = createDb();
