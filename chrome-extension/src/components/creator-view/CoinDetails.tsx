import React from "react";
import { CreatorInfo } from "../../utils/creatorState";
import { useMint } from "../../utils/mintState";
import { supplyAsNum, usePricing } from "../../utils/pricing";

import "./CoinDetails.css";

export function CoinDetails({ creatorInfo }: { creatorInfo: CreatorInfo | undefined }) {
  const mint = useMint(creatorInfo?.tokenBonding.targetMint);
  const supply = mint ? supplyAsNum(mint) : 0
  const { general } = usePricing(creatorInfo?.tokenBonding.publicKey)
  const coinPriceUsd = (creatorInfo?.coinPriceUsd || 0)

  return (
    <div className="coin-details">
      <div className="coin-details-item">
        <span>Coins in circulation</span>
        <span>{supply.toFixed(2)}</span>
      </div>
      <div className="coin-details-item">
        <span>Total USD Locked</span>
        <span>${mint && (general(0, supplyAsNum(mint)) * coinPriceUsd).toFixed(2)}</span>
      </div>
      <div className="coin-details-item">
        <span>USD Market cap</span>
        <span>${(supply * coinPriceUsd).toFixed(2)}</span>
      </div>
    </div>
  );
}
