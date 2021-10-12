import React, { Fragment, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Center, Box, Flex, Icon } from "@chakra-ui/react";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import { Leaderboard, LeaderboardNumber } from "../Leaderboard";
import { Spinner } from "../Spinner";
import { useAsync } from "react-async-hook";
import { handleErrors } from "../contexts";

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

type KeyAndRank = {
  rank: number;
  key: PublicKey;
};
interface IAccountsPagination {
  loading: boolean;
  accounts?: KeyAndRank[];
  pageUp(): void;
  pageDown(): void;
}
function zeroMin(input: number): number {
  return input < 0 ? 0 : input;
}

const PAGE_INCR = 10;

function useLocalAccountsPagination(
  getRank: GetRank,
  getTopWallets: GetTopWallets
): IAccountsPagination & { userRank?: number } {
  const [startIndex, setStartIndex] = useState<number>(0);
  const [stopIndex, setStopIndex] = useState<number>(0);
  const { loading, result: accountRank, error } = useAsync(getRank, []);
  const {
    loading: loading2,
    result: holders,
    error: error2,
  } = useAsync(getTopWallets, [startIndex, stopIndex]);

  handleErrors(error, error2);

  useEffect(() => {
    if (accountRank) {
      setStartIndex(accountRank);
      setStopIndex(accountRank + PAGE_INCR);
    }
  }, [accountRank]);

  return {
    accounts: holders?.map((publicKey, index) => ({
      rank: startIndex + index + 1,
      key: publicKey,
    })),
    userRank: accountRank,
    loading: loading || loading2,
    pageUp: () =>
      setStartIndex((startIndex) => zeroMin(startIndex - PAGE_INCR)),
    pageDown: () => setStopIndex((stopIndex) => stopIndex + PAGE_INCR),
  };
}
function useAccountsPagination(
  getTopWallets: GetTopWallets,
  initialFetchSize: number
): IAccountsPagination {
  const [startIndex, setStartIndex] = useState<number>(0);
  const [stopIndex, setStopIndex] = useState<number>(initialFetchSize);
  const { result, loading, error } = useAsync(getTopWallets, [
    startIndex,
    stopIndex,
  ]);
  handleErrors(error);

  return {
    accounts: result?.map((publicKey, index) => ({
      rank: startIndex + index + 1,
      key: publicKey,
    })),
    loading: loading,
    pageUp: () =>
      setStartIndex((startIndex) => zeroMin(startIndex - PAGE_INCR)),
    pageDown: () => setStopIndex((stopIndex) => stopIndex + PAGE_INCR),
  };
}

export type GetTopWallets = (
  startIndex: number,
  stopIndex: number
) => Promise<PublicKey[]>;
export type GetRank = () => Promise<number | undefined>;

export const WumboUserLeaderboard = React.memo(
  ({
    getRank,
    getTopWallets,
    Element,
    selected,
    initialFetchSize = 3,
  }: {
    getRank: GetRank;
    getTopWallets: GetTopWallets;
    Element: (props: { publicKey: PublicKey }) => React.ReactElement;
    selected: (key: PublicKey) => boolean;
    initialFetchSize?: number;
  }) => {
    const top = useAccountsPagination(getTopWallets, initialFetchSize);
    const local = useLocalAccountsPagination(getRank, getTopWallets);

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
            numbers={local.accounts.map(({ rank, key }) => (
              <LeaderboardNumber selected={selected(key)} key={"num" + rank}>
                {rank}
              </LeaderboardNumber>
            ))}
            elements={local.accounts.map(({ key }) => (
              <Element key={key.toBase58()} publicKey={key} />
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
            numbers={top.accounts.map(({ rank, key }) => (
              <LeaderboardNumber selected={selected(key)} key={"num" + rank}>
                {rank}
              </LeaderboardNumber>
            ))}
            elements={top.accounts.map(({ key }) => (
              <Element key={key.toBase58()} publicKey={key} />
            ))}
          />
          <PageChevron direction="down" onClick={top.pageDown} />
        </WhiteCard>
        {(local.userRank || 0) > top.accounts.length - 1 && localLeaderboard}
      </Flex>
    );
  }
);
