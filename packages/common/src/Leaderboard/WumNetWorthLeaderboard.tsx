import React, { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { gql, useApolloClient } from "@apollo/client";
import { useClaimedTokenRef } from "@strata-foundation/react";
import { WumboUserLeaderboard } from "./WumboUserLeaderboard";
import { UserLeaderboardElement } from "./UserLeaderboardElement";
import { useWumNetWorth } from "../hooks";

const GET_TOP_WUM = gql`
  query GetTopWumLocked($startRank: Int!, $stopRank: Int!) {
    topWumHolders(startRank: $startRank, stopRank: $stopRank) {
      publicKey
    }
  }
`;
const GET_TOKEN_RANK = gql`
  query GetWumRank($wallet: String!) {
    wumRank(publicKey: $wallet)
  }
`;

const Element = React.memo(
  ({
    wallet,
    onClick,
  }: {
    wallet: PublicKey;
    onClick?: (tokenRefKey: PublicKey) => void;
  }) => {
    const { info: tokenRef } = useClaimedTokenRef(wallet);

    const { wumNetWorth } = useWumNetWorth(wallet);
    const amount = wumNetWorth?.toFixed(2);

    return (
      <UserLeaderboardElement
        amount={amount}
        onClick={() => tokenRef && onClick && onClick(tokenRef.publicKey)}
        tokenRef={tokenRef}
      />
    );
  }
);

export const WumNetWorthLeaderboard = React.memo(
  ({
    wallet,
    onAccountClick,
  }: {
    wallet: PublicKey | undefined;
    onAccountClick?: (tokenRefKey: PublicKey) => void;
  }) => {
    const client = useApolloClient();

    const getRank = useMemo(
      () => () => {
        return client
          .query<{
            wumRank: number | undefined;
          }>({
            query: GET_TOKEN_RANK,
            variables: {
              wallet: wallet?.toBase58(),
            },
          })
          .then((result) => result.data.wumRank)
          .catch(() => undefined);
      },
      [wallet]
    );

    const getTopHolders = (startIndex: number, stopIndex: number) =>
      client
        .query<{
          topWumHolders: { publicKey: string }[];
        }>({
          query: GET_TOP_WUM,
          variables: {
            startRank: startIndex,
            stopRank: stopIndex,
          },
        })
        .then((result) =>
          result.data.topWumHolders.map(
            ({ publicKey }) => new PublicKey(publicKey)
          )
        )
        .catch(() => []);

    return (
      <WumboUserLeaderboard
        initialFetchSize={9}
        getRank={getRank}
        getTopWallets={getTopHolders}
        selected={(key) => (wallet ? wallet.equals(key) : false)}
        Element={({ publicKey }) => (
          <Element onClick={onAccountClick} wallet={publicKey} />
        )}
      />
    );
  }
);
