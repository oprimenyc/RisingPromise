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
const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1";

// Local development/runtime-verification uses node-postgres (Neon's driver
// cannot reach a plain local Postgres); production keeps Neon. Logged at boot
// so the runtime configuration is never ambiguous (D-005).
type Db = NeonDatabase<typeof schema>;

function createDb(): Db {
  if (isLocal) {
    console.log(`[db] driver=node-postgres host=${url.hostname} (local verification mode)`);
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    return drizzlePg(pool, { schema }) as unknown as Db;
  }
  console.log(`[db] driver=neon-serverless host=${url.hostname}`);
  const pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  return drizzleNeon(pool, { schema });
}

export const db = createDb();
