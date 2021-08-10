import React, { Fragment, useState } from "react";
import { ChevronRightIcon } from "@heroicons/react/solid";
import { TokenBondingV0 } from "spl-token-bonding";
import { useBondingPricing, useFiatPrice, useOwnedAmount } from "./utils/pricing";
import { useTokenMetadata } from "./utils/metaplex/hooks";
import { MetadataAvatar } from "./Avatar";
import { Spinner } from "./Spinner";
import { Link, useHistory } from "react-router-dom";

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
        className="hover:wum-cursor-pointer hover:wum-bg-gray-200 wum-flex wum-bg-gray-100 wum-p-4 wum-rounded-lg wum-space-x-4"
      >
        {icon}

        <div className="wum-flex wum-flex-col wum-flex-grow wum-justify-center wum-text-gray-700">
          <div className="wum-flex wum-justify-between wum-font-medium">
            <span>{name}</span>
            <span>${toFiat(current).toFixed(2) || 0.0}</span>
          </div>
          <div className="wum-flex wum-justify-between wum-text-xs">
            <span>{ticker}</span>
          </div>
        </div>
      </div>
    );
  }
);
