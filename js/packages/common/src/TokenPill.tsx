import React, { Fragment, useState } from "react";
import { CoinDetails } from "./CoinDetails";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import { TokenBondingV0 } from "spl-token-bonding";
import { useBondingPricing, useFiatPrice } from "./utils/pricing";
import { useTokenMetadata } from "./utils/metaplex/hooks";
import { MetadataAvatar } from "./Avatar";
import { Spinner } from "./Spinner";

interface TokenPillProps {
  name?: String;
  ticker?: String;
  icon?: React.ReactElement;
  tokenBonding: TokenBondingV0;
}

interface MetadataTokenPillProps {
  name?: string;
  ticker?: string;
  tokenBonding: TokenBondingV0;
}
export const MetadataTokenPill = React.memo(
  ({ name, ticker, tokenBonding }: MetadataTokenPillProps) => {
    const { metadata, loading } = useTokenMetadata(tokenBonding?.targetMint);
    const displayTicker = metadata?.data.symbol || ticker;
    const displayName = metadata?.data.name || name;
    const displayIcon = loading ? (
      <Spinner size="md" />
    ) : (
      <MetadataAvatar tokenBonding={tokenBonding} token name={displayTicker} />
    );

    return (
      <TokenPill
        name={displayName}
        ticker={displayTicker}
        icon={displayIcon}
        tokenBonding={tokenBonding}
      />
    );
  }
);

export const TokenPill = React.memo(
  ({ name, ticker, icon, tokenBonding }: TokenPillProps) => {
    const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
    const toggleDetails = () => setDetailsVisible(!detailsVisible);
    const { current } = useBondingPricing(tokenBonding.publicKey);
    const fiatPrice = useFiatPrice(tokenBonding.baseMint);
    const toFiat = (a: number) => (fiatPrice || 0) * a;

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
          <div className="px-2 py-2 mt-2 border-1 border-gray-300 rounded-lg">
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
