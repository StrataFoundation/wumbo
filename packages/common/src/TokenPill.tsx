import React from "react";
import { Flex } from "@chakra-ui/react";
import {
  useErrorHandler,
  useBondingPricing,
  useFiatPrice,
} from "@strata-foundation/react";
import {
  ITokenBonding,
  IPricingCurve,
} from "@strata-foundation/spl-token-bonding";
import { Spinner } from "./";
import { useTokenMetadata } from "./utils/metaplex";
import { MetadataAvatar } from "./Avatar";
import { useHistory } from "react-router-dom";

interface TokenPillProps {
  name?: String;
  ticker?: String;
  icon?: React.ReactElement;
  tokenBonding: ITokenBonding;
  detailsPath?: string;
  curve?: IPricingCurve;
}

interface MetadataTokenPillProps {
  name?: string;
  ticker?: string;
  tokenBonding: ITokenBonding;
  detailsPath?: string;
  curve?: IPricingCurve;
}
export const MetadataTokenPill = React.memo(
  ({
    name,
    ticker,
    tokenBonding,
    detailsPath,
    curve,
  }: MetadataTokenPillProps) => {
    const { handleErrors } = useErrorHandler();
    const { metadata, loading, error } = useTokenMetadata(
      tokenBonding?.targetMint
    );
    const displayTicker = metadata?.data.symbol || ticker;
    const displayName = metadata?.data.name || name;
    handleErrors(error);
    const displayIcon = loading ? (
      <Spinner />
    ) : (
      <MetadataAvatar tokenBonding={tokenBonding} name={displayTicker} />
    );

    return (
      <TokenPill
        curve={curve}
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
  ({
    name,
    ticker,
    icon,
    tokenBonding,
    detailsPath,
    curve: curvePassed,
  }: TokenPillProps) => {
    const { curve: curveResolved } = useBondingPricing(tokenBonding.publicKey);
    const fiatPrice = useFiatPrice(tokenBonding.baseMint);
    const toFiat = (a: number) => (fiatPrice || 0) * a;
    const history = useHistory();
    const curve = curvePassed || curveResolved;

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
            <span>
              {curve
                ? "$" + toFiat(curve!.current() || 0).toFixed(2)
                : "Loading"}
            </span>
          </Flex>
          <Flex justify="space-between" fontSize="xs">
            <span>{ticker}</span>
          </Flex>
        </Flex>
      </Flex>
    );
  }
);
