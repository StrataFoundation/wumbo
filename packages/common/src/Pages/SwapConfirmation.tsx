import { Text } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import {
  Spinner,
  useMint,
  useMintTokenRef,
  useTokenMetadata,
} from "@strata-foundation/react";
import { Confirmation } from "../Confirmation";
import React from "react";
import { useReverseTwitter, sample } from "../utils";
import { useConfig } from "../hooks";

const roundToDecimals = (num: number, decimals: number): number =>
  Math.trunc(num * Math.pow(10, decimals)) / Math.pow(10, decimals);

export const SwapConfirmation = ({
  mint,
  amount,
}: {
  mint: PublicKey | undefined;
  amount: number;
}) => {
  const { metadata, image, loading } = useTokenMetadata(mint);
  const mintAcct = useMint(mint);
  const { info: tokenRef, loading: loadingRef } = useMintTokenRef(mint);
  const { handle: refHandle } = useReverseTwitter(
    tokenRef?.owner as PublicKey | undefined
  );
  const handle = refHandle || metadata?.data.name;
  const config = useConfig();
  const tweets = config.tweets.swap;

  if (loading || loadingRef) {
    return <Spinner />;
  }

  return (
    <Confirmation
      tweet={handle && sample(tweets)?.replace("{handle}", handle)}
      bottomText={`Let @${handle} know that you bought their token!`}
      image={image}
    >
      <Text>
        You purchased <b>{roundToDecimals(amount, mintAcct?.decimals || 9)}</b>{" "}
        {metadata?.data.symbol}! Head to My Tokens to see your updated wallet.
      </Text>
    </Confirmation>
  );
};
