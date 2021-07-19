import React from "react";
import { supplyAsNum, useBondingPricing, useMint } from ".";
import { TokenBondingV0 } from "spl-token-bonding";

interface CoinDetailsProps {
  tokenBonding: TokenBondingV0;
  textSize?: string;
  toFiat(baseAmount: number): number;
}

export const CoinDetails = ({
  tokenBonding,
  toFiat,
  textSize = "text-xxs",
}: CoinDetailsProps) => {
  const mint = useMint(tokenBonding.targetMint);
  const supply = mint ? supplyAsNum(mint) : 0;
  const { targetRangeToBasePrice: general, current } = useBondingPricing(
    tokenBonding.publicKey
  );
  const coinPriceUsd = toFiat(current);
  const colClasses = `flex flex-col ${textSize}`;

  return (
    <div className="flex flex-row justify-between">
      <div className={colClasses}>
        <span>Coins in circulation</span>
        <span>{supply.toFixed(2)}</span>
      </div>
      <div className={colClasses}>
        <span>Total USD Locked</span>
        <span>
          ${mint && (general(0, supplyAsNum(mint)) * coinPriceUsd).toFixed(2)}
        </span>{" "}
      </div>
      <div className={colClasses}>
        <span>USD Market cap</span>
        <span>${(supply * coinPriceUsd).toFixed(2)}</span>
      </div>
    </div>
  );
};
