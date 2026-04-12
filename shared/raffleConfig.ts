/**
 * Raffle ticket tier definitions — single source of truth.
 * Imported by both server/routes.ts (uses priceInCents) and
 * client/src/lib/siteConfig.ts (derives price in dollars).
 */

export interface RaffleTier {
  id: string;
  label: string;
  priceInCents: number;
  entries: number;
  badge: string;
  description: string;
}

export const RAFFLE_TIERS: RaffleTier[] = [
  {
    id: "single",
    label: "Single Entry",
    priceInCents: 2500,
    entries: 1,
    badge: "",
    description: "One chance to win.",
  },
  {
    id: "supporter",
    label: "Supporter Pack",
    priceInCents: 10000,
    entries: 5,
    badge: "Most Popular",
    description: "5x the chances, 5x the impact.",
  },
  {
    id: "champion",
    label: "Champion Pack",
    priceInCents: 17500,
    entries: 10,
    badge: "Best Value",
    description: "Maximum entries, maximum impact.",
  },
];

/** O(1) lookup by tier id — for server-side use */
export const RAFFLE_TIERS_BY_ID: Record<string, RaffleTier> = Object.fromEntries(
  RAFFLE_TIERS.map((t) => [t.id, t])
);
