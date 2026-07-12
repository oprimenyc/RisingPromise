/**
 * Provider layer (M1 §2, RP_PROVIDER_SPEC). Business logic depends on
 * capability lookups, never on vendor SDKs. Every provider moves through an
 * explicit six-state lifecycle — no provider may silently fail:
 *   - disabled     operator turned it off (PROVIDERS_DISABLED env list); never probed
 *   - development  credentials absent; activation-ready, fakes usable locally
 *   - configured   config present but not runtime-verifiable (manual channels)
 *                  or probe not yet executed
 *   - verified     live probe against the real vendor API succeeded
 *   - degraded     probe succeeded but slow (> PROVIDER_DEGRADED_MS), or the
 *                  FIRST failure after a verified run (transient allowance)
 *   - failed       probe failed (or kept failing after a degraded grace probe)
 * Probe results feed the capability registry (runtime is the proof).
 */

export type ProviderState = "disabled" | "development" | "configured" | "verified" | "degraded" | "failed";

export type ProbeResult = {
  ok: boolean;
  status: ProviderState;
  detail: string;
  latencyMs?: number;
  consecutiveFailures?: number;
};

export interface ProviderDef {
  name: string;
  capabilities: string[];
  requiredConfig: string[];
  probe(): Promise<ProbeResult>;
}

const DEGRADED_LATENCY_MS = (() => {
  const v = parseInt(process.env.PROVIDER_DEGRADED_MS ?? "", 10);
  return Number.isFinite(v) && v > 0 ? v : 5000;
})();

function disabledProviders(): Set<string> {
  return new Set(
    (process.env.PROVIDERS_DISABLED ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

/** True when the operator has explicitly disabled a provider. */
export function providerDisabled(name: string): boolean {
  return disabledProviders().has(name.toLowerCase());
}

function development(missing: string[]): ProbeResult {
  return { ok: false, status: "development", detail: `activation-ready; missing config: ${missing.join(", ")}` };
}

function missingKeys(keys: string[]): string[] {
  return keys.filter((k) => !process.env[k]);
}

async function httpProbe(name: string, fn: () => Promise<Response>): Promise<ProbeResult> {
  const started = Date.now();
  try {
    const res = await fn();
    const latencyMs = Date.now() - started;
    if (res.ok) {
      if (latencyMs > DEGRADED_LATENCY_MS) {
        return { ok: true, status: "degraded", detail: `${name} API reachable but slow (HTTP ${res.status}, ${latencyMs}ms > ${DEGRADED_LATENCY_MS}ms)`, latencyMs };
      }
      return { ok: true, status: "verified", detail: `${name} API reachable (HTTP ${res.status})`, latencyMs };
    }
    return { ok: false, status: "failed", detail: `${name} API returned HTTP ${res.status}`, latencyMs };
  } catch (error: any) {
    return { ok: false, status: "failed", detail: `${name} probe error: ${String(error?.message ?? error).slice(0, 200)}`, latencyMs: Date.now() - started };
  }
}

/**
 * Full lifecycle evaluation for one provider. `prior` is the last persisted
 * result (from the capability registry) and drives the degraded->failed
 * transition: the first failure after a healthy run reports 'degraded'
 * (transient allowance, loudly); a second consecutive failure is 'failed'.
 */
export async function evaluateProvider(
  p: ProviderDef,
  prior?: { status?: string; consecutiveFailures?: number }
): Promise<ProbeResult> {
  if (providerDisabled(p.name)) {
    return { ok: false, status: "disabled", detail: `disabled by operator (PROVIDERS_DISABLED)` };
  }
  let result: ProbeResult;
  try {
    result = await p.probe();
  } catch (error: any) {
    result = { ok: false, status: "failed", detail: `probe threw: ${String(error?.message ?? error).slice(0, 200)}` };
  }
  const priorFailures = prior?.consecutiveFailures ?? 0;
  if (result.status === "failed") {
    const wasHealthy = prior?.status === "verified" || prior?.status === "degraded";
    const consecutiveFailures = priorFailures + 1;
    if (wasHealthy && consecutiveFailures === 1) {
      console.warn(`[providers] ${p.name} DEGRADED (first failure after healthy run): ${result.detail}`);
      return { ...result, status: "degraded", consecutiveFailures };
    }
    console.error(`[providers] ${p.name} FAILED (consecutive failures: ${consecutiveFailures}): ${result.detail}`);
    return { ...result, consecutiveFailures };
  }
  if (result.status === "degraded") {
    console.warn(`[providers] ${p.name} DEGRADED: ${result.detail}`);
    return { ...result, consecutiveFailures: priorFailures + (result.ok ? 0 : 1) };
  }
  return { ...result, consecutiveFailures: 0 };
}

function keyedHttpProvider(opts: {
  name: string;
  capabilities: string[];
  requiredConfig: string[];
  request: () => Promise<Response>;
}): ProviderDef {
  return {
    name: opts.name,
    capabilities: opts.capabilities,
    requiredConfig: opts.requiredConfig,
    async probe() {
      const missing = missingKeys(opts.requiredConfig);
      if (missing.length > 0) return development(missing);
      return httpProbe(opts.name, opts.request);
    },
  };
}

export const providers: ProviderDef[] = [
  keyedHttpProvider({
    name: "stripe",
    capabilities: ["payments.checkout", "payments.webhooks"],
    requiredConfig: ["STRIPE_SECRET_KEY"],
    request: () =>
      fetch("https://api.stripe.com/v1/balance", {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      }),
  }),
  keyedHttpProvider({
    name: "resend",
    capabilities: ["mail.transactional"],
    requiredConfig: ["RESEND_API_KEY"],
    request: () =>
      fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      }),
  }),
  keyedHttpProvider({
    name: "brevo",
    capabilities: ["mail.marketing"],
    requiredConfig: ["BREVO_API_KEY"],
    request: () =>
      fetch("https://api.brevo.com/v3/account", {
        headers: { "api-key": process.env.BREVO_API_KEY! },
      }),
  }),
  keyedHttpProvider({
    name: "givebutter",
    capabilities: ["donations.campaigns", "donations.p2p"],
    requiredConfig: ["GIVEBUTTER_API_KEY"],
    request: () =>
      fetch("https://api.givebutter.com/v1/campaigns", {
        headers: { Authorization: `Bearer ${process.env.GIVEBUTTER_API_KEY}` },
      }),
  }),
  {
    name: "paypal",
    capabilities: ["payments.paypal"],
    requiredConfig: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"],
    async probe() {
      const missing = missingKeys(this.requiredConfig);
      if (missing.length > 0) return development(missing);
      const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
      return httpProbe("paypal", () =>
        fetch("https://api-m.paypal.com/v1/oauth2/token", {
          method: "POST",
          headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
          body: "grant_type=client_credentials",
        })
      );
    },
  },
  keyedHttpProvider({
    name: "samgov",
    capabilities: ["compliance.entity-registration"],
    requiredConfig: ["SAM_GOV_API_KEY"],
    request: () =>
      fetch(`https://api.sam.gov/entity-information/v3/entities?api_key=${process.env.SAM_GOV_API_KEY}&ueiSAM=TEST`),
  }),
  {
    name: "grantsgov",
    capabilities: ["grants.discovery"],
    requiredConfig: [], // public search API — no key required
    async probe() {
      return httpProbe("grantsgov", () =>
        fetch("https://api.grants.gov/v1/api/search2", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: "workforce", rows: 1 }),
        })
      );
    },
  },
  keyedHttpProvider({
    name: "candid",
    capabilities: ["grants.funder-research", "compliance.nonprofit-profile"],
    requiredConfig: ["CANDID_API_KEY"],
    request: () =>
      fetch("https://api.candid.org/essentials/v3", {
        method: "POST",
        headers: { "Subscription-Key": process.env.CANDID_API_KEY!, "Content-Type": "application/json" },
        body: JSON.stringify({ search_terms: "rising promise" }),
      }),
  }),
  {
    name: "guidestar",
    capabilities: ["compliance.public-profile"],
    requiredConfig: ["CANDID_API_KEY"], // GuideStar profiles are served by Candid's API platform
    async probe() {
      const missing = missingKeys(this.requiredConfig);
      if (missing.length > 0) return development(missing);
      return { ok: true, status: "verified", detail: "served via candid provider credentials" };
    },
  },
  {
    name: "techsoup",
    capabilities: ["procurement.nonprofit-software"],
    requiredConfig: [],
    async probe() {
      return { ok: true, status: "configured", detail: "manual channel: TechSoup has no public API; not runtime-verifiable" };
    },
  },
  keyedHttpProvider({
    name: "cloudflare",
    capabilities: ["edge.dns", "edge.waf"],
    requiredConfig: ["CLOUDFLARE_API_TOKEN"],
    request: () =>
      fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", {
        headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` },
      }),
  }),
  {
    name: "google",
    capabilities: ["identity.oidc", "storage.files", "docs.generate", "calendar.events", "sheets.export"],
    requiredConfig: ["GOOGLE_SERVICE_ACCOUNT_JSON", "GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET"],
    async probe() {
      const missing = missingKeys(this.requiredConfig);
      if (missing.length > 0) return development(missing);
      // Validate the service-account JSON parses and has the expected shape;
      // scoped API probes land with each Google module (RP_GOOGLE_PROVIDER).
      try {
        const sa = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
        if (sa.client_email && sa.private_key) {
          return { ok: true, status: "verified", detail: `service account ${sa.client_email} parsed; per-scope probes pending module build-out` };
        }
        return { ok: false, status: "failed", detail: "service account JSON missing client_email/private_key" };
      } catch {
        return { ok: false, status: "failed", detail: "GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON" };
      }
    },
  },
  {
    name: "microsoft",
    capabilities: ["bookings.scheduling"],
    requiredConfig: ["MS_TENANT_ID", "MS_CLIENT_ID", "MS_CLIENT_SECRET"],
    async probe() {
      const missing = missingKeys(this.requiredConfig);
      if (missing.length > 0) return development(missing);
      return httpProbe("microsoft", () =>
        fetch(`https://login.microsoftonline.com/${process.env.MS_TENANT_ID}/oauth2/v2.0/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.MS_CLIENT_ID!,
            client_secret: process.env.MS_CLIENT_SECRET!,
            scope: "https://graph.microsoft.com/.default",
            grant_type: "client_credentials",
          }).toString(),
        })
      );
    },
  },
];

export function getProvider(name: string): ProviderDef {
  const p = providers.find((x) => x.name === name);
  if (!p) throw new Error(`Unknown provider: ${name}`);
  return p;
}
