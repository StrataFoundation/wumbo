import React, { Fragment, useState } from "react";
import { Avatar, CoinDetails } from "@/components/common";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import { PublicKey } from "@solana/web3.js";
import { TokenBondingV0 } from "@/spl-token-bonding-api/state";
import { useBondingPricing } from "@/utils/pricing";

interface TokenPillProps {
  name: String;
  ticker: String;
  icon: React.ReactElement;
  tokenBonding: TokenBondingV0;
  toFiat(baseAmount: number): number;
}

export default React.memo(
  ({ name, ticker, icon, tokenBonding, toFiat }: TokenPillProps) => {
    const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
    const toggleDetails = () => setDetailsVisible(!detailsVisible);
    const { current } = useBondingPricing(tokenBonding.publicKey);

    return (
      <Fragment>
        <div className="flex bg-gray-100 p-4 rounded-lg space-x-4">
          {icon}
          <div className="flex flex-col flex-grow justify-center text-gray-700">
            <div className="flex justify-between font-medium">
              <span>{name}</span>
              <span>${toFiat(current).toFixed(2) || 0.0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>{ticker}</span>
              <span
                className="flex align-center cursor-pointer"
                onClick={toggleDetails}
              >
                Details{" "}
                {!detailsVisible ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronUpIcon className="h-4 w-4" />
                )}
              </span>
            </div>
          </div>
        </div>
        {detailsVisible && (
          <div className="px-2 py-2 mt-4 border-1 border-gray-300 rounded-lg">
            <CoinDetails
              toFiat={toFiat}
              tokenBonding={tokenBonding}
              textSize="text-xxs"
            />
          </div>
        )}
      </Fragment>
    );
  }
);
