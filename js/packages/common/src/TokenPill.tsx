import React from "react";
import { useHistory } from "react-router-dom";
import {
  useBondingPricing,
  useFiatPrice,
  useTokenMetadata,
  ITokenBonding,
} from "./utils";
import { MetadataAvatar, Spinner } from "./";

interface TokenPillProps {
  name?: String;
  ticker?: String;
  icon?: React.ReactElement;
  tokenBonding: ITokenBonding;
  detailsPath?: string;
}

interface MetadataTokenPillProps {
  name?: string;
  ticker?: string;
  tokenBonding: ITokenBonding;
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
    const { curve } = useBondingPricing(tokenBonding.publicKey);
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
            <span>${toFiat(curve?.current() || 0).toFixed(2) || 0.0}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>{ticker}</span>
          </div>
        </div>
      </div>
    );
  }
);
