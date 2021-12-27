import { Button, ButtonProps } from "@chakra-ui/button";
import { Box, Center } from "@chakra-ui/layout";
import { PublicKey } from "@solana/web3.js";
import React, { useMemo } from "react";
import { usePriceInUsd } from "@strata-foundation/react";
import { Link } from "react-router-dom";
import { getTierGradient, useTokenTier } from "./hooks";

function isTransparent(color: string) {
  switch ((color || "").replace(/\s+/g, "").toLowerCase()) {
    case "transparent":
    case "":
    case "rgba(0,0,0,0)":
      return true;
    default:
      return false;
  }
}

function getBackgroundColor(
  elm: HTMLElement | null | undefined
): string | undefined {
  while (elm && isTransparent(elm.style.backgroundColor)) {
    elm = elm?.parentElement;
  }

  return elm?.style.backgroundColor;
}

function isDark(color: any): boolean {
  // Variables for red, green, blue values
  var r, g, b, hsp;

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If RGB --> store the red, green, blue values in separate variables
    color = color.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
    );

    r = color[1];
    g = color[2];
    b = color[3];
  } else {
    // If hex --> Convert it to RGB: http://gist.github.com/983661
    color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, "$&$&"));

    r = color >> 16;
    g = (color >> 8) & 255;
    b = color & 255;
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, determine whether the color is light or dark
  return hsp <= 127.5;
}

export function PriceButton({
  h = 22,
  r,
  link,
  mint,
  tokenBonding,
  buttonTarget,
  ...btnProps
}: {
  h?: number;
  w?: number;
  r?: number;
  buttonTarget?: HTMLElement;
  mint: PublicKey | undefined | null;
  tokenBonding: PublicKey | undefined | null;
  link?: string;
} & ButtonProps) {
  const tier = useTokenTier(tokenBonding);
  const gradient = getTierGradient(tier);
  const coinPriceUsd = usePriceInUsd(mint);

  const backgroundColor = useMemo(
    () => getBackgroundColor(buttonTarget) || "white",
    [buttonTarget]
  );
  return (
    <Center
      h={`${h}px`}
      background={gradient || "green.500"}
      padding="2px"
      borderRadius={r ? `${r}px` : "7.5px"}
    >
      <Button
        backgroundColor={backgroundColor}
        h={`${h - 4}px`}
        as={link ? Link : undefined}
        _hover={{
          background: isDark(backgroundColor) ? "gray.600" : "gray.300",
        }}
        to={link}
        size="xs"
        colorScheme="white"
        variant="solid"
        color={isDark(backgroundColor) ? "white" : "black"}
        fontFamily="body"
        {...btnProps}
      >
        ${coinPriceUsd?.toFixed(2) || "0.00"}
      </Button>
    </Center>
  );
}
