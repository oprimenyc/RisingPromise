/**
 * RP CORE SCHEMA — M1 platform foundation (RP_MASTER_ARCHITECTURE §2).
 * One identity, one event spine, registries, decision ledger, graph.
 * Re-exported from shared/schema.ts so drizzle-kit push picks it up.
 */
import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, integer, serial, jsonb, boolean, varchar, uniqueIndex, index } from "drizzle-orm/pg-core";

// ── Unified identity ────────────────────────────────────────────────────────
// One person, many roles/programs. LMS + site identities converge here.
export const persons = pgTable("core_persons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  primaryEmail: text("primary_email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// External authentication subjects mapped to persons (email, google, replit…)
export const identities = pgTable("core_identities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personId: varchar("person_id").notNull().references(() => persons.id),
  provider: text("provider").notNull(), // 'email' | 'google' | 'replit'
  subject: text("subject").notNull(),   // email address, OIDC sub, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("core_identities_provider_subject").on(t.provider, t.subject)]);

export const personRoles = pgTable("core_person_roles", {
  id: serial("id").primaryKey(),
  personId: varchar("person_id").notNull().references(() => persons.id),
  role: text("role").notNull(), // 'donor' | 'applicant' | 'student' | 'volunteer' | 'staff' | 'admin' | ...
  grantedBy: text("granted_by"),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("core_person_roles_unique").on(t.personId, t.role)]);

// ── Programs (organizational boundaries: V.I.A. / N.O.B.L.E. / Workforce) ──
export const programs = pgTable("core_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  // 'school' (V.I.A.), 'community' (N.O.B.L.E.), 'workforce' (CompTIA/CNA/WIOA), 'housing'
  programType: text("program_type").notNull(),
  parentSlug: text("parent_slug"), // e.g. comptia under workforce
  status: text("status").notNull().default("active"), // active | planned | paused
  description: text("description"),
});

export const programParticipations = pgTable("core_program_participations", {
  id: serial("id").primaryKey(),
  personId: varchar("person_id").notNull().references(() => persons.id),
  programId: varchar("program_id").notNull().references(() => programs.id),
  role: text("role").notNull(), // 'applicant' | 'student' | 'mentor' | 'instructor' | ...
  status: text("status").notNull().default("active"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  sourceRef: text("source_ref"), // e.g. program_applications.id
});

// ── Event bus (transactional outbox; at-least-once delivery) ───────────────
export const domainEvents = pgTable("core_events", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'DonationReceived', 'StudentEnrolled', ...
  payload: jsonb("payload").notNull(),
  actor: text("actor"), // personId or 'system' or 'webhook:stripe'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
}, (t) => [index("core_events_unprocessed").on(t.processedAt)]);

// ── Decision ledger ─────────────────────────────────────────────────────────
export const decisions = pgTable("core_decisions", {
  id: serial("id").primaryKey(),
  ledgerId: text("ledger_id").unique(), // e.g. 'D-001' for migrated file entries
  area: text("area").notNull(), // 'architecture' | 'security' | 'provider' | 'migration' | 'compliance'
  decision: text("decision").notNull(),
  rationale: text("rationale").notNull(),
  actor: text("actor").notNull(),
  decidedAt: timestamp("decided_at").defaultNow().notNull(),
});

// ── Capability registry (runtime-verified) ─────────────────────────────────
export const capabilities = pgTable("core_capabilities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  domain: text("domain").notNull(),
  owner: text("owner").notNull(), // owning department/role
  dependsOn: jsonb("depends_on").notNull().default(sql`'[]'::jsonb`), // provider/capability names
  // verified | degraded | failed | unconfigured | dormant | manual
  status: text("status").notNull().default("unconfigured"),
  evidence: jsonb("evidence"), // last probe output
  lastVerifiedAt: timestamp("last_verified_at"),
});

// ── Feature registry (user-visible features) ───────────────────────────────
export const features = pgTable("core_features", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  requiredCapabilities: jsonb("required_capabilities").notNull().default(sql`'[]'::jsonb`),
  requiredPermissions: jsonb("required_permissions").notNull().default(sql`'[]'::jsonb`),
  healthy: boolean("healthy"), // derived from capability statuses at verification time
  lastVerifiedAt: timestamp("last_verified_at"),
});

// ── Knowledge/capability graph (projected from events; never hand-curated) ─
export const graphNodes = pgTable("core_graph_nodes", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(), // 'person' | 'program' | 'campaign' | 'provider' | 'capability' | 'document' | 'policy' | 'event'
  refId: text("ref_id").notNull(), // id in the source table / registry name
  label: text("label").notNull(),
  sensitivity: text("sensitivity").notNull().default("internal"), // public | internal | restricted
  props: jsonb("props").notNull().default(sql`'{}'::jsonb`),
}, (t) => [uniqueIndex("core_graph_nodes_kind_ref").on(t.kind, t.refId)]);

export const graphEdges = pgTable("core_graph_edges", {
  id: serial("id").primaryKey(),
  fromNode: integer("from_node").notNull().references(() => graphNodes.id),
  toNode: integer("to_node").notNull().references(() => graphNodes.id),
  kind: text("kind").notNull(), // 'PARTICIPATES_IN' | 'DONATED_TO' | 'DEPENDS_ON' | ...
  props: jsonb("props").notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("core_graph_edges_from").on(t.fromNode), index("core_graph_edges_to").on(t.toNode)]);

export type Person = typeof persons.$inferSelect;
export type DomainEvent = typeof domainEvents.$inferSelect;
export type Capability = typeof capabilities.$inferSelect;
export type GraphNode = typeof graphNodes.$inferSelect;
