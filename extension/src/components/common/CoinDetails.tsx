import React from "react";
import { CreatorInfo } from "@/utils/creatorState";
import { useMint } from "@/utils/mintState";
import { supplyAsNum, usePricing } from "@/utils/pricing";

interface CoinDetailsProps {
  creatorInfo: CreatorInfo | undefined;
  textSize?: string;
}

export const CoinDetails = ({
  creatorInfo,
  textSize = "text-xxs",
}: CoinDetailsProps) => {
  const mint = useMint(creatorInfo?.tokenBonding.targetMint);
  const supply = mint ? supplyAsNum(mint) : 0;
  const { general } = usePricing(creatorInfo?.tokenBonding.publicKey);
  const coinPriceUsd = creatorInfo?.coinPriceUsd || 0;

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
