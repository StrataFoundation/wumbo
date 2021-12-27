import React, { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { gql, useApolloClient } from "@apollo/client";
import {
  useBondingPricing,
  usePriceInUsd,
  useTokenRefFromBonding,
  useTokenBonding,
  useTokenBondingFromMint,
} from "@strata-foundation/react";
import { WumboUserLeaderboard } from "./WumboUserLeaderboard";
import { UserLeaderboardElement } from "./UserLeaderboardElement";
import { NATIVE_MINT } from "@solana/spl-token";

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
    const { pricing } = useBondingPricing(tokenBondingKey);
    const { info: tokenBonding } = useTokenBonding(tokenBondingKey);
    const fiatPrice = usePriceInUsd(tokenBonding?.baseMint);
    const toFiat = (a: number) => (fiatPrice || 0) * a;

    const current = pricing?.locked(NATIVE_MINT);
    const amount = current ? "$" + toFiat(current).toFixed(2) : "";

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
