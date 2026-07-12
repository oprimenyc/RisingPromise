/**
 * ai.chat capability (M2 §1 provider extraction, D8: AI is a provider, not a
 * vendor call). Business logic requests a model TIER ("fast" | "quality");
 * the provider maps tiers to concrete vendor models so vendors stay
 * swappable (Claude/Gemini/OpenAI per RP_PROVIDER_SPEC). Metering/limits are
 * enforced by callers' guards (LMS aiGuard, L-005) — this module is transport.
 *
 * Vendor: OpenAI over plain REST (no SDK). null when unconfigured or
 * operator-disabled — callers fail visibly, same rule as payments/mail.
 */
import { providerDisabled } from "./index";

export interface AiChatRequest {
  system: string;
  user: string;
  tier?: "fast" | "quality";
  maxTokens?: number;
  temperature?: number;
}

export interface AiCapability {
  chat(req: AiChatRequest): Promise<string>;
}

const TIER_MODELS: Record<string, string> = {
  fast: process.env.AI_MODEL_FAST || "gpt-4o-mini",
  quality: process.env.AI_MODEL_QUALITY || "gpt-4o",
};

function openaiChat(apiKey: string): AiCapability {
  return {
    async chat(req) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: TIER_MODELS[req.tier ?? "fast"],
          messages: [
            { role: "system", content: req.system },
            { role: "user", content: req.user },
          ],
          max_tokens: req.maxTokens ?? 500,
          temperature: req.temperature ?? 0.7,
        }),
      });
      if (!res.ok) {
        const detail = await res.text().then((t) => t.slice(0, 300)).catch(() => "");
        throw new Error(`ai.chat provider error: HTTP ${res.status} ${detail}`);
      }
      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("ai.chat provider returned no content");
      return content;
    },
  };
}

/** null when unconfigured or operator-disabled — callers fail visibly. */
export const ai: AiCapability | null = (() => {
  if (providerDisabled("openai")) {
    console.warn("[providers] openai DISABLED by operator (PROVIDERS_DISABLED) — ai capability off");
    return null;
  }
  return process.env.OPENAI_API_KEY ? openaiChat(process.env.OPENAI_API_KEY) : null;
})();
