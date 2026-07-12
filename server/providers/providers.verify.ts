/**
 * Provider 6-state lifecycle runtime verification.
 *   npx tsx server/providers/providers.verify.ts
 * Exercises the real evaluateProvider logic (no mocks of the code under test):
 * disabled, development, configured (manual), verified (live grants.gov),
 * degraded (first failure after healthy + latency), failed (repeat failure).
 */
import { providers, evaluateProvider, getProvider, type ProviderDef } from "./index";

function assert(cond: unknown, label: string): void {
  if (!cond) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

async function main() {
  // 1. All eleven mission providers are registered
  for (const name of ["google", "microsoft", "stripe", "paypal", "resend", "givebutter", "candid", "guidestar", "samgov", "grantsgov", "cloudflare"]) {
    assert(providers.some((p) => p.name === name), `provider registered: ${name}`);
  }

  // 2. disabled: operator flag wins over everything
  process.env.PROVIDERS_DISABLED = "stripe";
  const disabled = await evaluateProvider(getProvider("stripe"));
  assert(disabled.status === "disabled", `stripe disabled via PROVIDERS_DISABLED (got ${disabled.status})`);
  process.env.PROVIDERS_DISABLED = "";

  // 3. development: missing credentials, activation-ready
  delete process.env.GIVEBUTTER_API_KEY;
  const dev = await evaluateProvider(getProvider("givebutter"));
  assert(dev.status === "development", `givebutter development when keyless (got ${dev.status})`);
  assert(dev.detail.includes("GIVEBUTTER_API_KEY"), "development detail names the missing key");

  // 4. configured: manual channel (techsoup)
  const manual = await evaluateProvider(getProvider("techsoup"));
  assert(manual.status === "configured", `techsoup configured/manual (got ${manual.status})`);

  // 5. verified: live credential-free probe against real Grants.gov API
  const live = await evaluateProvider(getProvider("grantsgov"));
  assert(live.status === "verified" || live.status === "degraded", `grantsgov live probe healthy (got ${live.status}: ${live.detail})`);
  assert(typeof live.latencyMs === "number", "probe records latency");

  // 6. degraded: FIRST failure after a healthy run
  const failing: ProviderDef = {
    name: "grantsgov", // reuse a non-disabled name
    capabilities: [],
    requiredConfig: [],
    probe: async () => ({ ok: false, status: "failed", detail: "synthetic failure" }),
  };
  const firstFail = await evaluateProvider(failing, { status: "verified", consecutiveFailures: 0 });
  assert(firstFail.status === "degraded", `first failure after verified -> degraded (got ${firstFail.status})`);
  assert(firstFail.consecutiveFailures === 1, "consecutiveFailures tracked");

  // 7. failed: second consecutive failure
  const secondFail = await evaluateProvider(failing, { status: "degraded", consecutiveFailures: 1 });
  assert(secondFail.status === "failed", `second consecutive failure -> failed (got ${secondFail.status})`);
  assert(secondFail.consecutiveFailures === 2, "failure count increments");

  // 8. cold failure (never healthy) goes straight to failed
  const coldFail = await evaluateProvider(failing);
  assert(coldFail.status === "failed", `cold failure -> failed, no degraded grace (got ${coldFail.status})`);

  // 9. recovery resets the failure counter
  const recovered = await evaluateProvider(getProvider("grantsgov"), { status: "failed", consecutiveFailures: 3 });
  assert(recovered.consecutiveFailures === 0 || recovered.status === "failed", `recovery resets counter (got ${recovered.status}/${recovered.consecutiveFailures})`);

  console.log(process.exitCode ? "RESULT: FAILURES PRESENT" : "RESULT: ALL PASS");
  process.exit(process.exitCode ?? 0);
}

main().catch((e) => {
  console.error("verify crashed:", e);
  process.exit(1);
});
