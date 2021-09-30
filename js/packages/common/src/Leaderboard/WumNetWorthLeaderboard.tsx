import React, { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import { WumboUserLeaderboard } from "./WumboUserLeaderboard";
import { useBondingPricing, useFiatPrice, useUserOwnedAmount } from "../utils/pricing";
import { TokenBonding, useAccount, useClaimedTokenRef, useReverseTwitter, useTokenRefFromBonding } from "../utils";
import { UserLeaderboardElement } from "./UserLeaderboardElement";
import { WUM_TOKEN } from "../constants";

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

const GET_NET_WORTH = gql`
  query GetNetWorth($wallet: String!) {
    wumNetWorth(wallet: $wallet)
  }
`;

const Element = React.memo(({ wallet, onClick }: { wallet: PublicKey, onClick?: (tokenRefKey: PublicKey) => void }) => {
  const { info: tokenRef } = useClaimedTokenRef(wallet)

  const { data: { wumNetWorth } = {} } = useQuery<{ wumNetWorth: number }>(GET_NET_WORTH, {
    variables: {
      wallet: wallet.toBase58()
    }
  })
  const amount = wumNetWorth?.toFixed(2)

  return <UserLeaderboardElement
    amount={amount}
    onClick={() => tokenRef && onClick && onClick(tokenRef.publicKey)}
    tokenRef={tokenRef}
  />
})

export const WumNetWorthLeaderboard = React.memo(({ wallet, onAccountClick }: { wallet: PublicKey | undefined, onAccountClick?: (tokenRefKey: PublicKey) => void }) => {
  const client = useApolloClient()

  const getRank = useMemo(() => () => {
    return client.query<{
      wumRank: number | undefined;
    }>({
      query: GET_TOKEN_RANK,
      variables: {
        wallet: wallet?.toBase58()
      }
    }).then(result => result.data.wumRank).catch(() => undefined)
  }, [wallet])

  const getTopHolders = (startIndex: number, stopIndex: number) => client.query<{
    topWumHolders: { publicKey: string }[];
  }>({
    query: GET_TOP_WUM,
    variables: {
      startRank: startIndex,
      stopRank: stopIndex
    }
  }).then(result => result.data.topWumHolders.map(({ publicKey }) => new PublicKey(publicKey))).catch(() => [])

  return <WumboUserLeaderboard
    initialFetchSize={9}
    getRank={getRank}
    getTopWallets={getTopHolders}
    selected={key => wallet ? wallet.equals(key) : false}
    Element={({ publicKey }) => <Element onClick={onAccountClick} wallet={publicKey} />}
  />
})
