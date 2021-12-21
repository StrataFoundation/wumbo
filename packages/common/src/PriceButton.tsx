import { getTierGradient, useTokenTier } from "wumbo-common";
import { Button, ButtonProps } from "@chakra-ui/button";
import { Box, Center } from "@chakra-ui/layout";
import { PublicKey } from "@solana/web3.js";
import React from "react";
import { usePriceInUsd } from "@strata-foundation/react";
import { Link } from "react-router-dom";

export function PriceButton({
  h = 22,
  r,
  link,
  mint,
  tokenBonding,
  ...btnProps
}: {
  h?: number,
  w?: number,
  r?: number,
  mint: PublicKey | undefined | null,
  tokenBonding: PublicKey | undefined | null,
  link?: string,
} & ButtonProps) {
  const tier = useTokenTier(tokenBonding);
  const gradient = getTierGradient(tier);
  const coinPriceUsd = usePriceInUsd(mint);

  return (
    <Center
      h={`${h}px`}
      background={gradient || "green.500"}
      padding="2px"
      borderRadius={r ? `${r}px` : "7.5px"}
    >
      <Button
        h={`${h-4}px`}
        as={link ? Link : undefined}
        _hover={{
          background: "gray.300"
        }}
        to={link}
        size="xs"
        colorScheme="white"
        backgroundColor="white"
        variant="solid"
        color="black"
        fontFamily="body"
        {...btnProps}
      >
        ${coinPriceUsd?.toFixed(2) || "0.00"}
      </Button>
    </Center>
  );
}
