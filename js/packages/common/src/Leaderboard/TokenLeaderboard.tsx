import React, { Fragment, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Center, Box, Flex, Icon } from "@chakra-ui/react";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import {
  Leaderboard,
  LeaderboardNumber,
  MetadataLeaderboardElement,
} from "../Leaderboard";
import { Spinner } from "../Spinner";
import { useWallet } from "../contexts/walletContext";
import { useQuery, gql } from "@apollo/client";

const WhiteCard = ({ children = null as any }) => (
  <Box
    w="full"
    bg="white"
    boxShadow="lg"
    rounded="md"
    overflow="hidden"
    borderWidth="1px"
    borderColor="gray.100"
  >
    {children}
  </Box>
);

const PageChevron = ({
  direction,
  onClick,
}: {
  direction: "up" | "down";
  onClick?: () => void;
}) => (
  <Flex
    w="full"
    padding={1}
    alignItems="center"
    justifyContent="center"
    color="indigo.600"
    _hover={{ cursor: "pointer", bgColor: "gray.100" }}
    onClick={onClick}
  >
    {direction == "up" && <Icon as={HiChevronUp} h={4} w={4} />}
    {direction == "down" && <Icon as={HiChevronDown} h={4} w={4} />}
  </Flex>
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
    accountRank(mint: $mint, publicKey: $key)
  }
`;
function useLocalAccountsPagination(
  mintKey: PublicKey | undefined,
  findAccount?: PublicKey
): IAccountsPagination & { userRank?: number } {
  const [startIndex, setStartIndex] = useState<number>(0);
  const [stopIndex, setStopIndex] = useState<number>(0);

  const { loading: loadingRank, data: { accountRank } = {} } = useQuery<{
    accountRank: number | undefined;
  }>(GET_HOLDER_RANK, {
    variables: {
      mint: mintKey?.toBase58(),
      key: findAccount?.toBase58(),
    },
  });

  useEffect(() => {
    if (accountRank) {
      setStartIndex(accountRank);
      setStopIndex(accountRank + 5);
    }
  }, [accountRank]);
  const { loading, data: { topHolders: accounts } = {} } = useQuery<{
    topHolders: { publicKey: string }[];
  }>(GET_TOP_HOLDERS, {
    variables: {
      mint: mintKey?.toBase58(),
      startRank: startIndex,
      stopRank: stopIndex,
    },
  });

  return {
    accounts: accounts?.map(({ publicKey }, index) => ({
      rank: startIndex + index + 1,
      wallet: new PublicKey(publicKey),
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
  const [stopIndex, setStopIndex] = useState<number>(3);

  const { loading, data: { topHolders: accounts } = {} } = useQuery<{
    topHolders: { publicKey: string }[];
  }>(GET_TOP_HOLDERS, {
    variables: {
      mint: mintKey?.toBase58(),
      startRank: startIndex,
      stopRank: stopIndex,
    },
  });

  return {
    accounts: accounts?.map(({ publicKey }, index) => ({
      rank: startIndex + index + 1,
      wallet: new PublicKey(publicKey),
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
      return (
        <Box w="full" h="full">
          <Center
            padding={4}
            rounded="lg"
            fontSize="lg"
            fontWeight="medium"
            color="gray.400"
            bgColor="gray.100"
          >
            No token holders
          </Center>
        </Box>
      );
    }

    const localLeaderboard = (
      <Fragment>
        <Center
          fontWeight="bold"
          fontSize="2xl"
          color="gray.500"
          marginBottom={2}
        >
          ...
        </Center>
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
      <Flex flexDirection="column" paddingTop={2} alignItems="stretch">
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
      </Flex>
    );
  }
);
