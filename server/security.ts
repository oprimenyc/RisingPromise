import crypto from "crypto";
import type { Request, RequestHandler } from "express";

/**
 * M0 security hardening (see RP_IMPLEMENTATION_ROADMAP.md).
 * - Timing-safe admin password check (SHA-256 compare, never plain !==)
 * - In-memory rate limiting (no new dependencies; durable limiter arrives with
 *   the M1 job/observability spine — limitation is documented, not hidden)
 * - HTTP Basic auth for internal static pages (exec bible)
 *
 * Admin secret: set ADMIN_PASSWORD_SHA256 (hex of sha256(password)).
 * Fallback: if only ADMIN_PASSWORD is set, it is hashed at boot and a warning
 * is logged asking for migration to the hashed form.
 */

function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

function getAdminHash(): string | null {
  if (process.env.ADMIN_PASSWORD_SHA256) {
    return process.env.ADMIN_PASSWORD_SHA256.toLowerCase();
  }
  if (process.env.ADMIN_PASSWORD) {
    console.warn(
      "[security] ADMIN_PASSWORD is set in plaintext; prefer ADMIN_PASSWORD_SHA256 (hex sha256 of the password)."
    );
    return sha256Hex(process.env.ADMIN_PASSWORD);
  }
  return null;
}

export function verifyAdminPassword(candidate: unknown): boolean {
  const hash = getAdminHash();
  if (!hash || typeof candidate !== "string" || candidate.length === 0) {
    return false;
  }
  const a = Buffer.from(sha256Hex(candidate), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function adminConfigured(): boolean {
  return getAdminHash() !== null;
}

// ---------------------------------------------------------------------------
// Rate limiting (fixed window, per IP, in-memory)
// ---------------------------------------------------------------------------

type Window = { count: number; start: number };

export function rateLimit(opts: {
  name: string;
  max: number;
  windowMs: number;
}): RequestHandler {
  const windows = new Map<string, Window>();
  return (req, res, next) => {
    // Periodic cleanup so the map cannot grow unbounded
    if (windows.size > 10_000) windows.clear();
    const key = clientIp(req);
    const now = Date.now();
    const w = windows.get(key);
    if (!w || now - w.start >= opts.windowMs) {
      windows.set(key, { count: 1, start: now });
      return next();
    }
    w.count += 1;
    if (w.count > opts.max) {
      console.warn(`[security] rate limit '${opts.name}' hit by ${key}`);
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    return next();
  };
}

function clientIp(req: Request): string {
  // Railway/Cloudflare sit in front; trust the left-most forwarded address
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  return req.socket.remoteAddress ?? "unknown";
}

// ---------------------------------------------------------------------------
// Admin gate for API routes (header: x-admin-password)
// ---------------------------------------------------------------------------

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!adminConfigured()) {
    console.error("[security] admin endpoint hit but no admin password configured");
    return res.status(500).json({ error: "Admin access is not configured on the server." });
  }
  if (!verifyAdminPassword(req.headers["x-admin-password"])) {
    console.warn(`[security] admin auth DENIED for ${clientIp(req)} ${req.method} ${req.path}`);
    return res.status(401).json({ error: "Unauthorized." });
  }
  return next();
};

// ---------------------------------------------------------------------------
// HTTP Basic auth for internal pages (browser-friendly shared-secret gate)
// ---------------------------------------------------------------------------

export const requireBasicAdmin: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization ?? "";
  if (header.startsWith("Basic ")) {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const password = decoded.slice(decoded.indexOf(":") + 1);
    if (verifyAdminPassword(password)) return next();
  }
  console.warn(`[security] internal page auth DENIED for ${clientIp(req)} ${req.path}`);
  res.set("WWW-Authenticate", 'Basic realm="Rising Promise internal"');
  return res.status(401).send("Authentication required.");
};
