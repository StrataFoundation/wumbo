import React, { Fragment, useState } from "react";
import { Flex, Spinner } from "@chakra-ui/react";
import { HiChevronRight } from "react-icons/hi";
import {
  useBondingPricing,
  useFiatPrice,
  useOwnedAmount,
} from "./utils/pricing";
import { useTokenMetadata } from "./utils/metaplex";
import { MetadataAvatar } from "./Avatar";
import { Link, useHistory } from "react-router-dom";
import { ITokenBonding } from "./utils/deserializers/spl-token-bonding";

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
      <Flex
        w="full"
        rounded="lg"
        bgColor="gray.100"
        padding={4}
        _hover={{
          bgColor: "gray.200",
          cursor: "pointer",
        }}
        onClick={() => detailsPath && history.push(detailsPath)}
      >
        {icon}
        <Flex
          flexDir="column"
          grow={1}
          justify="center"
          color="gray.700"
          paddingLeft={4}
        >
          <Flex justify="space-between" fontSize="lg" fontWeight="medium">
            <span>{name}</span>
            <span>${toFiat(curve?.current() || 0).toFixed(2) || 0.0}</span>
          </Flex>
          <Flex justify="space-between" fontSize="xs">
            <span>{ticker}</span>
          </Flex>
        </Flex>
      </Flex>
    );
  }
);
