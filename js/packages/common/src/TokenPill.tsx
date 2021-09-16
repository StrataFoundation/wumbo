import React from "react";
import { TokenBondingV0 } from "@wum.bo/spl-token-bonding";
import { useBondingPricing, useFiatPrice } from "./utils/pricing";
import { useTokenMetadata } from "./utils/metaplex";
import { MetadataAvatar } from "./Avatar";
import { Spinner } from "./Spinner";
import { useHistory } from "react-router-dom";

interface TokenPillProps {
  name?: String;
  ticker?: String;
  icon?: React.ReactElement;
  tokenBonding: TokenBondingV0;
  detailsPath?: string;
}

interface MetadataTokenPillProps {
  name?: string;
  ticker?: string;
  tokenBonding: TokenBondingV0;
  detailsPath?: string;
}
export const MetadataTokenPill = React.memo(
  ({ name, ticker, tokenBonding, detailsPath }: MetadataTokenPillProps) => {
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
        detailsPath={detailsPath}
      />
    );
  }
);

export const TokenPill = React.memo(
  ({ name, ticker, icon, tokenBonding, detailsPath }: TokenPillProps) => {
    const { current } = useBondingPricing(tokenBonding.publicKey);
    const fiatPrice = useFiatPrice(tokenBonding.baseMint);
    const toFiat = (a: number) => (fiatPrice || 0) * a;
    const history = useHistory();

    return (
      <div
        onClick={() => detailsPath && history.push(detailsPath)}
        className="hover:cursor-pointer hover:bg-gray-200 flex bg-gray-100 p-4 rounded-lg space-x-4"
      >
        {icon}

        <div className="flex flex-col flex-grow justify-center text-gray-700">
          <div className="flex justify-between font-medium">
            <span>{name}</span>
            <span>${toFiat(current).toFixed(2) || 0.0}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>{ticker}</span>
          </div>
        </div>
      </div>
    );
  }
);
