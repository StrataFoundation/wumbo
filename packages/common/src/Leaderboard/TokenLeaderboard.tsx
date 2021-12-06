import React, { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { gql, useApolloClient } from "@apollo/client";
import {
  useUserOwnedAmount,
  useSocialTokenMetadata,
} from "@strata-foundation/react";
import { WumboUserLeaderboard } from "./WumboUserLeaderboard";
import { UserLeaderboardElement } from "./UserLeaderboardElement";
import { Spinner } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";

const GET_TOP_HOLDERS = gql`
  query GetTopHolders($mint: String!, $startRank: Int!, $stopRank: Int!) {
    topHolders(mint: $mint, startRank: $startRank, stopRank: $stopRank) {
      publicKey
    }
  }
`;
const GET_HOLDER_RANK = gql`
  query GetHolderRank($mint: String!, $key: String!) {
    accountRank(mint: $mint, publicKey: $key)
  }
`;

const Element = React.memo(
  ({
    wallet,
    mint,
    onClick,
  }: {
    mint: PublicKey | undefined;
    wallet: PublicKey;
    onClick?: (tokenRefKey: PublicKey) => void;
  }) => {
    const amount = useUserOwnedAmount(wallet, mint)?.toFixed(2);
    const { tokenRef, loading } = useSocialTokenMetadata(wallet);

    if (loading || !tokenRef) {
      return <Spinner />;
    }

    return (
      <UserLeaderboardElement
        amount={amount}
        onClick={() => tokenRef && onClick && onClick(tokenRef.publicKey)}
        tokenRef={tokenRef}
      />
    );
  }
);

export const TokenLeaderboard = React.memo(
  ({
    mintKey,
    onAccountClick,
  }: {
    mintKey: PublicKey | undefined;
    onAccountClick?: (tokenRefKey: PublicKey) => void;
  }) => {
    const { adapter } = useWallet();
    const publicKey = adapter?.publicKey;
    const client = useApolloClient();

    const getRank = useMemo(
      () => () => {
        return client
          .query<{
            accountRank: number | undefined;
          }>({
            query: GET_HOLDER_RANK,
            variables: {
              mint: mintKey?.toBase58(),
              key: publicKey?.toBase58(),
            },
          })
          .then((result) => result.data.accountRank)
          .catch(() => undefined);
      },
      [mintKey]
    );

    const getTopHolders = (startIndex: number, stopIndex: number) =>
      client
        .query<{
          topHolders: { publicKey: string }[];
        }>({
          query: GET_TOP_HOLDERS,
          variables: {
            mint: mintKey?.toBase58(),
            key: publicKey?.toBase58(),
            startRank: startIndex,
            stopRank: stopIndex,
          },
        })
        .then((result) =>
          result.data.topHolders.map(
            ({ publicKey }) => new PublicKey(publicKey)
          )
        )
        .catch(() => []);

    return (
      <WumboUserLeaderboard
        getRank={getRank}
        getTopWallets={getTopHolders}
        selected={(key) => (publicKey ? key.equals(publicKey) : false)}
        Element={({ publicKey }) => (
          <Element onClick={onAccountClick} wallet={publicKey} mint={mintKey} />
        )}
      />
    );
  }
);
