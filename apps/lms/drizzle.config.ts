import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // CRITICAL: the LMS owns ONLY the "lms" schema on the shared cluster.
  // Without this filter drizzle-kit manages "public" too and will DROP the
  // site/core tables it doesn't know about (verified destructively on a
  // throwaway cluster, 2026-07-12). Never remove.
  schemaFilter: ["lms"],
});
