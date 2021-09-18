import React, { Fragment, useEffect, useState } from "react";
import { Spinner } from "../Spinner";
import { PublicKey } from "@solana/web3.js";
import { Leaderboard, LeaderboardNumber, MetadataLeaderboardElement } from "../Leaderboard";
import { useWallet } from "../contexts/walletContext";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import { useQuery, gql } from '@apollo/client';

const WhiteCard = ({ children = null as any }) => (
  <div className="bg-white rounded-md shadow-md border-1">{children}</div>
);

const PageChevron = ({
  direction,
  onClick,
}: {
  direction: "up" | "down";
  onClick?: () => void;
}) => (
  <div className="hover:bg-gray-100 hover:cursor-pointer w-full flex flex-col items-center">
    {direction == "up" && <ChevronUpIcon onClick={onClick} className="h-4 w-4 text-indigo-600" />}
    {direction == "down" && (
      <ChevronDownIcon onClick={onClick} className="h-4 w-4 text-indigo-600" />
    )}
  </div>
);

type WalletAndRank = {
  rank: number;
  wallet: PublicKey;
};
interface IAccountsPagination {
  loading: boolean;
  accounts?: WalletAndRank[];
  pageUp(): void;
  pageDown(): void;
}
function zeroMin(input: number): number {
  return input < 0 ? 0 : input;
}
const GET_TOP_HOLDERS = gql`
  query GetTopHolders($mint: String!, $startRank: Int!, $stopRank: Int!) {
    topHolders(mint: $mint, startRank: $startRank, stopRank: $stopRank) {
      publicKey
    }
  }
`;
const GET_HOLDER_RANK = gql`
  query GetHolderRank($mint: String!, $key: String!) {
    accountRank(mint: $mint, startRank: $startRank, stopRank: $stopRank) {
      publicKey
    }
  }
`;
function useLocalAccountsPagination(
  mintKey: PublicKey | undefined,
  findAccount?: PublicKey
): IAccountsPagination & { userRank?: number } {
  const [startIndex, setStartIndex] = useState<number>(0);
  const [stopIndex, setStopIndex] = useState<number>(0);

  const { loading: loadingRank, data: { accountRank } = {} } = useQuery<{ accountRank: number | undefined }>(GET_HOLDER_RANK, {
    variables: {
      mint: mintKey?.toBase58(),
      key: findAccount?.toBase58()
    }
  })

  useEffect(() => {
    if (accountRank) {
      setStartIndex(accountRank);
      setStopIndex(accountRank + 5);
    }
  }, [accountRank])
  const { loading, data: { topHolders: accounts } = {} } = useQuery<{ topHolders: { publicKey: string }[] }>(GET_TOP_HOLDERS, {
    variables: {
      mint: mintKey?.toBase58(),
      startRank: startIndex,
      stopRank: stopIndex
    }
  })

  return {
    accounts: accounts?.map(({ publicKey }, index) => ({
      rank: startIndex + index + 1,
      wallet: new PublicKey(publicKey)
    })),
    userRank: accountRank,
    loading: loadingRank || loading,
    pageUp: () => setStartIndex((startIndex) => zeroMin(startIndex - 5)),
    pageDown: () => setStopIndex((stopIndex) => stopIndex + 5),
  };
}
function useAccountsPagination(
  mintKey: PublicKey | undefined
): IAccountsPagination {
  const [startIndex, setStartIndex] = useState<number>(0);
  const [stopIndex, setStopIndex] = useState<number>(5);

  const { loading, data: { topHolders: accounts } = {} } = useQuery<{ topHolders: { publicKey: string }[] }>(GET_TOP_HOLDERS, {
    variables: {
      mint: mintKey?.toBase58(),
      startRank: startIndex,
      stopRank: stopIndex
    }
  })

  return {
    accounts: accounts?.map(({ publicKey }, index) => ({
      rank: startIndex + index + 1,
      wallet: new PublicKey(publicKey)
    })),
    loading: loading,
    pageUp: () => setStartIndex((startIndex) => zeroMin(startIndex - 5)),
    pageDown: () => setStopIndex((stopIndex) => stopIndex + 5),
  };
}

export const TokenLeaderboard = React.memo(
  ({
    mint,
    onAccountClick,
  }: {
    mint: PublicKey;
    onAccountClick?: (tokenRefKey: PublicKey) => void;
  }) => {
    const { publicKey } = useWallet();
    const top = useAccountsPagination(mint);
    const local = useLocalAccountsPagination(mint, publicKey || undefined);

    if (top.loading || local.loading || !local.accounts || !top.accounts) {
      return (
        <div className="flex flex-col items-center flex-grow">
          <Spinner color="primary" size="lg" />
        </div>
      );
    }

    if (top.accounts?.length === 0) {
      return <div>No token holders</div>;
    }

    const localLeaderboard = (
      <Fragment>
        <div className="text-center text-bold text-2xl text-gray-500 mb-2">...</div>
        <WhiteCard>
          <PageChevron direction="up" onClick={local.pageUp} />
          <Leaderboard
            numbers={local.accounts.map(({ rank, wallet }) => (
              <LeaderboardNumber
                selected={wallet.toBase58() == publicKey?.toBase58()}
                key={"num" + rank}
              >
                {rank}
              </LeaderboardNumber>
            ))}
            elements={local.accounts.map(({ rank, wallet }) => (
              <MetadataLeaderboardElement
                mint={mint}
                onClick={onAccountClick}
                key={"el" + rank}
                wallet={wallet}
              />
            ))}
          />
          <PageChevron direction="down" onClick={local.pageDown} />
        </WhiteCard>
      </Fragment>
    );

    return (
      <div className="pt-2 flex flex-col items-stretch">
        <WhiteCard>
          <Leaderboard
            numbers={top.accounts.map(({ rank, wallet }) => (
              <LeaderboardNumber
                selected={!!publicKey && wallet.equals(publicKey)}
                key={"num" + rank}
              >
                {rank}
              </LeaderboardNumber>
            ))}
            elements={top.accounts.map(({ rank, wallet }) => (
              <MetadataLeaderboardElement
                mint={mint}
                onClick={onAccountClick}
                key={"el" + rank}
                wallet={wallet}
              />
            ))}
          />
          <PageChevron direction="down" onClick={top.pageDown} />
        </WhiteCard>
        {(local.userRank || 0) > top.accounts.length - 1 && localLeaderboard}
      </div>
    );
  }
);
