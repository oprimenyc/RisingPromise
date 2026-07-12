/**
 * Unified auth broker (M1 §2/D3): OIDC login against core_persons with
 * DB-backed revocable sessions. Google Cloud Identity is the primary IdP;
 * the broker is ACTIVATION-READY without credentials — routes stay mounted
 * and fail closed with a clear 503 naming the missing keys, and the google
 * provider stays in 'development' state until the owner supplies
 * GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET.
 *
 * Protocol notes (no vendor SDK, standard OIDC over TLS):
 *  - authorization-code flow with state (CSRF) checked server-side
 *  - the code is exchanged server-to-server; profile comes from Google's
 *    userinfo endpoint over TLS, so JWT signature verification is not
 *    load-bearing here (we never trust an inbound unverified token)
 * Account linking: google sub match -> that person; else verified-email
 * match -> link identity to existing person; else create person.
 */
import crypto from "crypto";
import type { Express, Request, Response, NextFunction } from "express";
import { db } from "../db";
import { persons, identities, authSessions, personRoles } from "../../shared/schema";
import { and, eq, isNull, gt } from "drizzle-orm";
import { ensurePerson, linkIdentity } from "./identity";
import { publishEvent } from "./events";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week
const COOKIE_NAME = "rp_session";

function oauthConfig(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export function brokerConfigured(): boolean {
  return oauthConfig() !== null;
}

// Short-lived state store for CSRF protection (10-minute window). In-memory
// is acceptable: losing state on restart only forces a login retry.
const pendingStates = new Map<string, { createdAt: number; redirectTo: string }>();
function pruneStates(): void {
  const cutoff = Date.now() - 10 * 60 * 1000;
  pendingStates.forEach((v, k) => {
    if (v.createdAt < cutoff) pendingStates.delete(k);
  });
}

function baseUrl(req: Request): string {
  const proto = (req.headers["x-forwarded-proto"] as string) ?? req.protocol;
  return `${proto}://${req.get("host")}`;
}

/** Follow merge tombstones to the surviving person (bounded hop count). */
export async function resolvePerson(personId: string): Promise<string> {
  let id = personId;
  for (let hops = 0; hops < 10; hops++) {
    const [row] = await db.select({ mergedInto: persons.mergedInto }).from(persons).where(eq(persons.id, id));
    if (!row?.mergedInto) return id;
    id = row.mergedInto;
  }
  throw new Error(`resolvePerson: merge chain exceeds 10 hops from ${personId} (data corruption?)`);
}

export async function issueSession(personId: string, provider: string): Promise<{ id: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const [session] = await db.insert(authSessions).values({ personId, provider, expiresAt }).returning();
  return { id: session.id, expiresAt };
}

export async function sessionPerson(sessionId: string): Promise<{ personId: string; provider: string } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) return null;
  const [session] = await db
    .select()
    .from(authSessions)
    .where(and(eq(authSessions.id, sessionId), isNull(authSessions.revokedAt), gt(authSessions.expiresAt, new Date())));
  if (!session) return null;
  return { personId: await resolvePerson(session.personId), provider: session.provider };
}

export async function revokeSession(sessionId: string): Promise<void> {
  await db.update(authSessions).set({ revokedAt: new Date() }).where(eq(authSessions.id, sessionId));
}

function readSessionCookie(req: Request): string | null {
  const raw = req.headers.cookie;
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === COOKIE_NAME) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function setSessionCookie(res: Response, sessionId: string, expiresAt: Date): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}${secure}`);
}

function clearSessionCookie(res: Response): void {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

/** Express middleware: attach req.personId when a valid session exists. */
export async function attachSession(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const sid = readSessionCookie(req);
    if (sid) {
      const found = await sessionPerson(sid);
      if (found) {
        (req as any).personId = found.personId;
        (req as any).sessionId = sid;
      }
    }
  } catch (error: any) {
    console.error(`[auth] session lookup failed: ${String(error?.message ?? error)}`);
  }
  next();
}

/** Route guard: require a broker session (401 otherwise). */
export function requireSession(req: Request, res: Response, next: NextFunction): void {
  if ((req as any).personId) return next();
  res.status(401).json({ error: "Authentication required." });
}

export function registerAuthBroker(app: Express): void {
  if (!brokerConfigured()) {
    console.warn("[auth] Google OIDC broker ACTIVATION-READY but unconfigured — set GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET to enable unified login");
  } else {
    console.log("[auth] Google OIDC broker configured");
  }

  app.use(attachSession);

  // public(reason: login entrypoint — must be reachable unauthenticated)
  app.get("/api/auth/google", (req, res) => {
    const cfg = oauthConfig();
    if (!cfg) {
      return res.status(503).json({ error: "Unified login is not configured.", missing: ["GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET"] });
    }
    pruneStates();
    const state = crypto.randomBytes(24).toString("hex");
    const redirectTo = typeof req.query.redirect === "string" && req.query.redirect.startsWith("/") ? req.query.redirect : "/";
    pendingStates.set(state, { createdAt: Date.now(), redirectTo });
    const params = new URLSearchParams({
      client_id: cfg.clientId,
      redirect_uri: `${baseUrl(req)}/api/auth/google/callback`,
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
    });
    res.redirect(`${GOOGLE_AUTH_URL}?${params}`);
  });

  // public(reason: OIDC redirect target — must be reachable unauthenticated)
  app.get("/api/auth/google/callback", async (req, res) => {
    const cfg = oauthConfig();
    if (!cfg) return res.status(503).json({ error: "Unified login is not configured." });
    try {
      const { code, state } = req.query as Record<string, string>;
      if (!code || !state || !pendingStates.has(state)) {
        return res.status(400).json({ error: "Invalid or expired login attempt. Please retry." });
      }
      const { redirectTo } = pendingStates.get(state)!;
      pendingStates.delete(state);

      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: cfg.clientId,
          client_secret: cfg.clientSecret,
          redirect_uri: `${baseUrl(req)}/api/auth/google/callback`,
          grant_type: "authorization_code",
        }).toString(),
      });
      if (!tokenRes.ok) {
        console.error(`[auth] google token exchange failed: HTTP ${tokenRes.status} ${await tokenRes.text().then((t) => t.slice(0, 300))}`);
        return res.status(502).json({ error: "Login failed at the identity provider. Please retry." });
      }
      const tokens = (await tokenRes.json()) as { access_token: string };

      const infoRes = await fetch(GOOGLE_USERINFO_URL, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
      if (!infoRes.ok) {
        console.error(`[auth] google userinfo failed: HTTP ${infoRes.status}`);
        return res.status(502).json({ error: "Login failed at the identity provider. Please retry." });
      }
      const profile = (await infoRes.json()) as { sub: string; email?: string; email_verified?: boolean; given_name?: string; family_name?: string };

      // Account linking
      const [existing] = await db
        .select({ personId: identities.personId })
        .from(identities)
        .where(and(eq(identities.provider, "google"), eq(identities.subject, profile.sub)));
      let personId: string;
      if (existing) {
        personId = await resolvePerson(existing.personId);
      } else if (profile.email && profile.email_verified !== false) {
        personId = await ensurePerson(profile.email, { first: profile.given_name, last: profile.family_name });
        personId = await resolvePerson(personId);
        await linkIdentity(personId, "google", profile.sub);
        await publishEvent("IdentityLinked", { personId, provider: "google" }, personId);
      } else {
        return res.status(403).json({ error: "Google account has no verified email; cannot sign in." });
      }

      const session = await issueSession(personId, "google");
      setSessionCookie(res, session.id, session.expiresAt);
      res.redirect(redirectTo);
    } catch (error: any) {
      console.error(`[auth] callback error: ${String(error?.message ?? error)}`);
      res.status(500).json({ error: "Login failed. Please retry." });
    }
  });

  // public(reason: identity self-check; returns 401 when unauthenticated)
  app.get("/api/auth/me", requireSession, async (req, res) => {
    const personId = (req as any).personId as string;
    const [person] = await db.select().from(persons).where(eq(persons.id, personId));
    const roles = await db.select({ role: personRoles.role }).from(personRoles).where(eq(personRoles.personId, personId));
    res.json({ personId, email: person?.primaryEmail, firstName: person?.firstName, lastName: person?.lastName, roles: roles.map((r) => r.role) });
  });

  // public(reason: logout must work for any session holder)
  app.post("/api/auth/logout", async (req, res) => {
    const sid = (req as any).sessionId as string | undefined;
    if (sid) await revokeSession(sid);
    clearSessionCookie(res);
    res.json({ success: true });
  });
}
