import { gql, useApolloClient } from "@apollo/client";
import { Spinner } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  useAssociatedTokenAddress,
  useMint,
  usePrimaryClaimedTokenRef,
  useTokenAccount,
  useTokenBonding,
} from "@strata-foundation/react";
import { amountAsNum } from "@strata-foundation/spl-token-bonding";
import React, { useMemo } from "react";
import { UserLeaderboardElement } from "./UserLeaderboardElement";
import { WumboUserLeaderboard } from "./WumboUserLeaderboard";

const GET_TOP_HOLDERS = gql`
  query GetTopHolders(
    $tokenBonding: String!
    $startRank: Int!
    $stopRank: Int!
  ) {
    topHolders(
      tokenBonding: $tokenBonding
      startRank: $startRank
      stopRank: $stopRank
    ) {
      publicKey
    }
  }
`;
const GET_HOLDER_RANK = gql`
  query GetHolderRank($tokenBonding: String!, $account: String!) {
    accountRank(tokenBonding: $tokenBonding, account: $account)
  }
`;

const Element = React.memo(
  ({
    account,
    onClick,
  }: {
    account: PublicKey;
    onClick?: (mintKey: PublicKey) => void;
  }) => {
    const { info: tokenAccount, loading } = useTokenAccount(account);
    const mint = useMint(tokenAccount?.mint);
    const { info: tokenRef, loading: loadingTokenRef } =
      usePrimaryClaimedTokenRef(tokenAccount?.owner);

    if (loading || loadingTokenRef) {
      return <Spinner />;
    }

    return (
      <UserLeaderboardElement
        displayKey={tokenAccount?.owner}
        amount={
          tokenAccount &&
          mint &&
          amountAsNum(tokenAccount.amount, mint).toFixed(2)
        }
        onClick={() => tokenRef && onClick && onClick(tokenRef.mint)}
        mint={tokenRef?.mint}
      />
    );
  }
);

export const TokenLeaderboard = React.memo(
  ({
    tokenBonding,
    onAccountClick,
  }: {
    tokenBonding: PublicKey | undefined;
    onAccountClick?: (mintKey: PublicKey) => void;
  }) => {
    const { wallet } = useWallet();
    const publicKey = wallet?.adapter?.publicKey;
    const { info: tokenBondingAcc } = useTokenBonding(tokenBonding);
    const { result: ata } = useAssociatedTokenAddress(
      wallet?.adapter?.publicKey,
      tokenBondingAcc?.targetMint
    );
    const client = useApolloClient();

    const getRank = useMemo(
      () => () => {
        return client
          .query<{
            accountRank: number | undefined;
          }>({
            query: GET_HOLDER_RANK,
            variables: {
              tokenBonding: tokenBonding?.toBase58(),
              account: ata?.toBase58(),
            },
          })
          .then((result) => result.data.accountRank)
          .catch(() => undefined);
      },
      [tokenBonding]
    );

    const getTopHolders = (startIndex: number, stopIndex: number) =>
      client
        .query<{
          topHolders: { publicKey: string }[];
        }>({
          query: GET_TOP_HOLDERS,
          variables: {
            tokenBonding: tokenBonding?.toBase58(),
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
        getTopAccounts={getTopHolders}
        selected={(key) => (publicKey ? key.equals(publicKey) : false)}
        Element={({ publicKey }) => (
          <Element onClick={onAccountClick} account={publicKey} />
        )}
      />
    );
  }
);
