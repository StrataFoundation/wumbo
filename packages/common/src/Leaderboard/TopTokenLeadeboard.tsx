import { gql, useApolloClient } from "@apollo/client";
import { PublicKey } from "@solana/web3.js";
import { numberWithCommas } from "@strata-foundation/marketplace-ui";
import {
  useBondingPricing,
  usePriceInUsd,
  useTokenBonding,
} from "@strata-foundation/react";
import React, { useMemo } from "react";
import { UserLeaderboardElement } from "./UserLeaderboardElement";
import { WumboUserLeaderboard } from "./WumboUserLeaderboard";

const GET_TOP_TOKENS = gql`
  query GetTopTokens($baseMint: String!, $startRank: Int!, $stopRank: Int!) {
    topTokens(baseMint: $baseMint, startRank: $startRank, stopRank: $stopRank) {
      publicKey
    }
  }
`;
const GET_TOKEN_RANK = gql`
  query GetTokenRank($baseMint: String!, $tokenBonding: String!) {
    tokenRank(baseMint: $baseMint, tokenBonding: $tokenBonding)
  }
`;

const Element = React.memo(
  ({
    tokenBondingKey,
    onClick,
  }: {
    tokenBondingKey: PublicKey;
    onClick?: (mintKey: PublicKey) => void;
  }) => {
    const { info: tokenBonding } = useTokenBonding(tokenBondingKey);
    const { pricing } = useBondingPricing(tokenBondingKey);
    const lowestMint = useMemo(() => {
      const arr = pricing?.hierarchy.toArray() || [];
      if (arr.length > 0) {
        return arr[arr.length - 1].tokenBonding.baseMint;
      }
    }, [pricing]);
    const fiatPrice = usePriceInUsd(lowestMint);
    const baseLocked = pricing?.locked(lowestMint);
    const amount =
      baseLocked && fiatPrice ? "$" + (baseLocked * fiatPrice).toFixed(2) : "";

    return (
      <UserLeaderboardElement
        displayKey={tokenBonding?.targetMint}
        amount={amount}
        onClick={() =>
          tokenBonding && onClick && onClick(tokenBonding.targetMint)
        }
        mint={tokenBonding?.targetMint}
      />
    );
  }
);

export const TopTokenLeaderboard = React.memo(
  ({
    mintKey,
    tokenBondingKey,
    onAccountClick,
  }: {
    tokenBondingKey: PublicKey | undefined;
    mintKey: PublicKey | undefined;
    onAccountClick?: (tokenRefKey: PublicKey) => void;
  }) => {
    const client = useApolloClient();

    const getRank = useMemo(() => {
      if (tokenBondingKey && mintKey) {
        return () => {
          return client
            .query<{
              tokenRank: number | undefined;
            }>({
              query: GET_TOKEN_RANK,
              variables: {
                tokenBonding: tokenBondingKey,
                baseMint: mintKey?.toBase58(),
              },
            })
            .then((result) => result.data.tokenRank)
            .catch(() => undefined);
        };
      } else {
        return () => Promise.resolve(undefined);
      }
    }, [tokenBondingKey, mintKey]);

    const getTopHolders = useMemo(() => {
      if (mintKey) {
        return (startIndex: number, stopIndex: number) => {
          return client
            .query<{
              topTokens: { publicKey: string }[];
            }>({
              query: GET_TOP_TOKENS,
              variables: {
                baseMint: mintKey.toBase58(),
                startRank: startIndex,
                stopRank: stopIndex,
              },
            })
            .then((result) =>
              result.data.topTokens.map(
                ({ publicKey }) => new PublicKey(publicKey)
              )
            )
            .catch(() => [] as PublicKey[]);
        };
      } else {
        return () => Promise.resolve<PublicKey[]>([]);
      }
    }, [mintKey]);

    return (
      <WumboUserLeaderboard
        initialFetchSize={9}
        getRank={getRank}
        getTopAccounts={getTopHolders}
        selected={(key) =>
          tokenBondingKey ? tokenBondingKey.equals(key) : false
        }
        Element={({ publicKey }) => (
          <Element onClick={onAccountClick} tokenBondingKey={publicKey} />
        )}
      />
    );
  }
);
