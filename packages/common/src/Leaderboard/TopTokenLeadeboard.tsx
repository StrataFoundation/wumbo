import React, { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { gql, useApolloClient } from "@apollo/client";
import {
  useBondingPricing,
  usePriceInUsd,
  useTokenRefFromBonding,
  useTokenBonding,
} from "@strata-foundation/react";
import { WumboUserLeaderboard } from "./WumboUserLeaderboard";
import { UserLeaderboardElement } from "./UserLeaderboardElement";
import { NATIVE_MINT } from "@solana/spl-token";

const GET_TOP_TOKENS = gql`
  query GetTopTokens($startRank: Int!, $stopRank: Int!) {
    topTokens(startRank: $startRank, stopRank: $stopRank) {
      publicKey
    }
  }
`;
const GET_TOKEN_RANK = gql`
  query GetTokenRank($tokenBondingKey: String!) {
    tokenRank(tokenBondingKey: $tokenBondingKey)
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

    const { info: tokenRef } = useTokenRefFromBonding(tokenBondingKey);
    const current = pricing?.current(NATIVE_MINT);
    const amount = current ? "$" + toFiat(current).toFixed(2) : "";

    return (
      <UserLeaderboardElement
        amount={amount}
        onClick={() => tokenRef && onClick && onClick(tokenRef.mint)}
        tokenRef={tokenRef}
      />
    );
  }
);

export const TopTokenLeaderboard = React.memo(
  ({
    tokenBondingKey,
    onAccountClick,
  }: {
    tokenBondingKey: PublicKey | undefined;
    onAccountClick?: (tokenRefKey: PublicKey) => void;
  }) => {
    const client = useApolloClient();

    const getRank = useMemo(
      () => () => {
        return client
          .query<{
            tokenRank: number | undefined;
          }>({
            query: GET_TOKEN_RANK,
            variables: {
              tokenBondingKey: tokenBondingKey?.toBase58(),
            },
          })
          .then((result) => result.data.tokenRank)
          .catch(() => undefined);
      },
      [tokenBondingKey]
    );

    const getTopHolders = (startIndex: number, stopIndex: number) =>
      client
        .query<{
          topTokens: { publicKey: string }[];
        }>({
          query: GET_TOP_TOKENS,
          variables: {
            startRank: startIndex,
            stopRank: stopIndex,
          },
        })
        .then((result) =>
          result.data.topTokens.map(({ publicKey }) => new PublicKey(publicKey))
        )
        .catch(() => []);

    return (
      <WumboUserLeaderboard
        initialFetchSize={9}
        getRank={getRank}
        getTopWallets={getTopHolders}
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
