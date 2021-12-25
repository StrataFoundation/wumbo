import { Flex } from "@chakra-ui/react";
import {
  useBondingPricing,
  usePriceInUsd
} from "@strata-foundation/react";
import {
  BondingPricing, ITokenBonding
} from "@strata-foundation/spl-token-bonding";
import React from "react";
import { useHistory } from "react-router-dom";

interface TokenPillProps {
  name?: String;
  ticker?: String;
  icon?: React.ReactElement;
  tokenBonding: ITokenBonding;
  detailsPath?: string;
  pricing?: BondingPricing;
}

export const TokenPill = React.memo(
  ({
    name,
    ticker,
    icon,
    tokenBonding,
    detailsPath,
    pricing: pricingPassed,
  }: TokenPillProps) => {
    const { pricing: pricingResolved } = useBondingPricing(
      tokenBonding.publicKey
    );
    const fiatPrice = usePriceInUsd(tokenBonding.baseMint);
    const toFiat = (a: number) => (fiatPrice || 0) * a;
    const history = useHistory();
    const pricing = pricingPassed || pricingResolved;

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
              {pricing
                ? "$" + toFiat(pricing!.current() || 0).toFixed(2)
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
