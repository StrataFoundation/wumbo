import { NATIVE_MINT } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import {
  useBondingPricing,
  usePriceInUsd,
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
  Gold: "",
  Silver: "",
};
export function getTierGradient(tier: TokenTier): string {
  return TierGradients[tier];
}

export function useTokenTier(
  tokenBonding: PublicKey | undefined | null
): TokenTier | undefined {
  const { pricing } = useBondingPricing(tokenBonding);
  const fiatPrice = useSolPrice();
  const locked = (pricing?.locked(NATIVE_MINT) || 0) * (fiatPrice || 0);

  const found = Object.entries(TierCutoffs)
    .reverse()
    .find(([tier, value]) => locked && locked >= value);

  return found && (found[0] as TokenTier);
}
