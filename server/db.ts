import { drizzle as drizzleNeon, type NeonDatabase } from "drizzle-orm/neon-serverless";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import ws from "ws";

// Configure Neon to use the ws library for WebSocket connections
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const url = new URL(process.env.DATABASE_URL);
const isNeon = url.hostname.endsWith(".neon.tech");

// Only actual Neon endpoints speak Neon's websocket proxy protocol. Railway's
// own Postgres addon (postgres.railway.internal) and local Postgres both use
// plain TCP, so node-postgres is required there — using the Neon driver
// against them fails every connection with ECONNREFUSED on the websocket
// upgrade. Logged at boot so the runtime configuration is never ambiguous (D-005).
type Db = NeonDatabase<typeof schema>;

function createDb(): Db {
  if (!isNeon) {
    console.log(`[db] driver=node-postgres host=${url.hostname}`);
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    return drizzlePg(pool, { schema }) as unknown as Db;
  }
  console.log(`[db] driver=neon-serverless host=${url.hostname}`);
  const pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  return drizzleNeon(pool, { schema });
}

export const db = createDb();
