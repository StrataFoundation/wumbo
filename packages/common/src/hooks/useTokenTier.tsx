import { NATIVE_MINT } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import {
  useBondingPricing,
  useUsdLocked,
  useSolPrice,
} from "@strata-foundation/react";

export type TokenTier = "Platinum" | "Gold" | "Silver";

export const TierCutoffs: Record<TokenTier, number> = {
  Platinum: 1_000_000,
  Gold: 100_000,
  Silver: 10_000,
};

const TierGradients: Record<TokenTier, string> = {
  Platinum:
    "linear-gradient(115.09deg, #BEDBEA 3.94%, #77ACCA 24.55%, #06141D 48.17%, #2FCFFF 86.38%)",
  Gold: "linear-gradient(115.09deg, #B08A51 3.94%, #C6A565 24.55%, #EDD78A 48.17%, #805700 86.38%)",
  Silver:
    "linear-gradient(110.9deg, #101010 4.19%, #D0D0D0 26.86%, #C5C5C5 52.83%, #363636 94.85%)",
};

export function getTierGradient(
  tier: TokenTier | undefined
): string | undefined {
  return tier ? TierGradients[tier] : "";
}

export function useTokenTier(
  tokenBonding: PublicKey | undefined | null
): TokenTier | undefined {
  const locked = useUsdLocked(tokenBonding || undefined);

  const found = Object.entries(TierCutoffs)
    .sort(([tier, value], [tier2, value2]) => (value2 > value ? 1 : -1))
    .find(([tier, value]) => locked && locked >= value);

  return found && (found[0] as TokenTier);
}
