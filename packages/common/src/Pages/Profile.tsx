import React from "react";
import { Link } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { useQuery as apolloUseQuery, gql } from "@apollo/client";
import {
  VStack,
  HStack,
  Spacer,
  Icon,
  Text,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Link as PlainLink,
  Flex,
  Box,
} from "@chakra-ui/react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import {
  useErrorHandler,
  useTokenRef,
  useTokenBonding,
  useBondingPricing,
  useMint,
  usePriceInUsd,
  usePrimaryClaimedTokenRef,
  useClaimedTokenRefKey,
  useTokenMetadata,
  supplyAsNum,
  useProvider,
  useMintTokenRef,
  useTokenBondingFromMint,
} from "@strata-foundation/react";
import { ITokenWithMetaAndAccount } from "@strata-foundation/spl-token-collective";
import { Spinner } from "../Spinner";
import { useQuery, useReverseTwitter } from "../utils";
import { useUserTokensWithMeta } from "../hooks";
import { StatCard, StatCardWithIcon } from "../StatCard";
import { Avatar, MetadataAvatar, PriceChangeTicker } from "..";
import { TokenLeaderboard } from "../Leaderboard/TokenLeaderboard";
import { NftListRaw } from "../Nft";
import { TROPHY_CREATOR } from "../constants/globals";
import { FaChevronRight } from "react-icons/fa";
import { useWallet } from "@solana/wallet-adapter-react";
import { NATIVE_MINT } from "@solana/spl-token";
import {
  TokenBondingRecentTransactionsProvider,
  useTokenBondingRecentTransactions,
} from "../contexts";
import { TopTokenLeaderboard } from "../Leaderboard";

interface IProfileProps
  extends Pick<ISocialTokenTabsProps, "onAccountClick" | "getNftLink"> {
  mintKey: PublicKey;
  editPath: string;
  collectivePath: string | null;
  onTradeClick?: () => void;
  useClaimFlow: (handle: string | undefined | null) => IClaimFlowOutput;
}

export interface IClaimFlowOutput {
  error: Error | undefined;
  loading: boolean;
  claim: () => Promise<void>;
}

const GET_WUM_RANK = gql`
  query GetWumRank($wallet: String!) {
    wumRank(publicKey: $wallet)
  }
`;

const GET_TOKEN_RANK = gql`
  query GetTokenRank($tokenBonding: String!) {
    tokenRank(tokenBondingKey: $tokenBonding)
  }
`;

const VolumeCard = ({ baseMint }: { baseMint: PublicKey }) => {
  const { transactions, loading, error, hasMore } =
    useTokenBondingRecentTransactions();
  const coinPriceUsd = usePriceInUsd(baseMint);

  const { handleErrors } = useErrorHandler();
  handleErrors(error);

  if (loading || !coinPriceUsd) {
    return <StatCard label="24h Volume" value="Loading..." />;
  }

  const totalBaseMintChange = (transactions || []).reduce((acc, txn) => {
    return acc + Math.abs(txn.baseAmount);
  }, 0);

  return (
    <StatCard
      label="24h Volume"
      value={
        "$" +
        (totalBaseMintChange * coinPriceUsd).toFixed(2) +
        (hasMore ? "+" : "")
      }
    />
  );
};

export const Profile = React.memo(
  ({
    useClaimFlow,
    mintKey,
    onAccountClick,
    onTradeClick,
    getNftLink,
    editPath,
    collectivePath,
  }: IProfileProps) => {
    const { handleErrors } = useErrorHandler();
    const { info: tokenRef, loading } = useMintTokenRef(mintKey);
    const ownerWalletKey = tokenRef?.owner as PublicKey | undefined;
    const { info: walletTokenRef } = usePrimaryClaimedTokenRef(ownerWalletKey);
    const { info: tokenBonding, loading: tokenBondingLoading } =
      useTokenBondingFromMint(mintKey);
    const {
      metadata,
      loading: loadingMetadata,
      error: tokenMetadataError,
    } = useTokenMetadata(tokenBonding?.targetMint);
    const {
      image: collectiveImage,
      metadata: collectiveMetadata,
      loading: loadingCollectiveMetadata,
      error: collectiveMetadataError,
    } = useTokenMetadata(tokenBonding?.baseMint);
    const baseMintTokenBonding = useTokenBondingFromMint(
      tokenBonding?.baseMint
    );
    const baseIsCollective = !!baseMintTokenBonding.info;

    const { awaitingApproval } = useProvider();
    const { adapter } = useWallet();
    const publicKey = adapter?.publicKey;
    const myTokenRefKey = useClaimedTokenRefKey(publicKey, null);
    const { handle: walletTwitterHandle, error: reverseTwitterError } =
      useReverseTwitter(publicKey || undefined);
    const { data: { tokenRank } = {} } = apolloUseQuery<{
      tokenRank: number | undefined;
    }>(GET_TOKEN_RANK, {
      variables: { tokenBonding: tokenBonding?.publicKey.toBase58() },
    });

    const mint = useMint(mintKey);
    const supply = mint ? supplyAsNum(mint) : 0;
    const { pricing } = useBondingPricing(tokenBonding?.publicKey);
    const fiatPrice = usePriceInUsd(NATIVE_MINT);
    const toFiat = (a: number) => (fiatPrice || 0) * a;
    const coinPriceUsd = toFiat(pricing?.current(NATIVE_MINT) || 0);
    const nativeLocked = pricing?.locked(NATIVE_MINT);
    const fiatLocked =
      mint &&
      typeof nativeLocked !== "undefined" &&
      toFiat(nativeLocked || 0).toFixed(2);

    const query = useQuery();
    let { handle, error: reverseTwitterError2 } =
      useReverseTwitter(ownerWalletKey);
    if (!handle) {
      handle = query.get("name") || metadata?.data.name;
    }
    const {
      claim,
      loading: claiming,
      error: claimError,
    } = useClaimFlow(handle);

    handleErrors(
      claimError,
      reverseTwitterError,
      reverseTwitterError2,
      tokenMetadataError,
      collectiveMetadataError
    );

    if (
      loading ||
      tokenBondingLoading ||
      !tokenBonding ||
      loadingMetadata ||
      loadingCollectiveMetadata
    ) {
      return <Spinner />;
    }

    const handleLink = (
      <PlainLink href={`https://twitter.com/${handle}`}>@{handle}</PlainLink>
    );
    return (
      <TokenBondingRecentTransactionsProvider
        tokenBonding={tokenBonding.publicKey}
      >
        <VStack w="full" spacing={4} padding={4}>
          <HStack spacing={2} w="full" alignItems="start">
            <VStack spacing={"6px"} alignItems="start">
              <MetadataAvatar
                mb={"8px"}
                size="lg"
                tokenBonding={tokenBonding}
                name="UNCLAIMED"
              />
              <HStack spacing={2} alignItems="center">
                <Text fontSize="18px" lineHeight="none">
                  {metadata?.data.name || handleLink}
                </Text>
                {myTokenRefKey &&
                  walletTokenRef?.publicKey.equals(myTokenRefKey) && (
                    <Link
                      style={{ display: "flex", alignItems: "center" }}
                      to={editPath}
                    >
                      <Icon
                        as={HiOutlinePencilAlt}
                        w={5}
                        h={5}
                        color="indigo.500"
                        _hover={{ color: "indigo.700", cursor: "pointer" }}
                      />
                    </Link>
                  )}
              </HStack>
              {metadata && (
                <Text fontSize="14px">
                  {metadata.data.symbol} |&nbsp;{handleLink}
                </Text>
              )}
              {!metadata && (
                <Text fontSize="14px">UNCLAIMED |&nbsp;{handleLink}</Text>
              )}
            </VStack>
            <Spacer />
            <VStack spacing={2} alignItems="stretch">
              {baseIsCollective && collectivePath && collectiveMetadata && (
                <Link to={collectivePath}>
                  <HStack
                    _hover={{ cursor: "pointer", bgColor: "gray.100" }}
                    w="full"
                    spacing={2}
                    padding={2}
                    rounded="lg"
                    borderWidth="2px"
                    borderColor="gray.100"
                  >
                    <Avatar src={collectiveImage} w="24px" h="24px" />
                    <Flex
                      justifyContent="space-between"
                      flexDir="column"
                      flexGrow={1}
                      lineHeight="normal"
                    >
                      <Text
                        lineHeight="14.4px"
                        fontWeight={800}
                        fontSize="12px"
                      >
                        {collectiveMetadata?.data.symbol}
                      </Text>
                      <Text fontSize="10px" color="gray.500">
                        {collectiveMetadata?.data.name}
                      </Text>
                    </Flex>
                    <Icon
                      justifySelf="end"
                      as={FaChevronRight}
                      color="gray.400"
                      height="16px"
                    />
                  </HStack>
                </Link>
              )}
            </VStack>
          </HStack>
          <HStack spacing={2} w="full">
            <Button size="xs" colorScheme="indigo" onClick={onTradeClick}>
              Trade
            </Button>
            <Button size="xs" colorScheme="green" onClick={onTradeClick}>
              ${coinPriceUsd.toFixed(2)}
            </Button>
            <PriceChangeTicker tokenBonding={tokenBonding.publicKey} />
            {tokenRef &&
              !tokenRef.isClaimed &&
              !walletTokenRef &&
              (!walletTwitterHandle || walletTwitterHandle == handle) && (
                <Button
                  size="xs"
                  colorScheme="indigo"
                  variant="outline"
                  onClick={claim}
                  isLoading={claiming}
                  loadingText={
                    awaitingApproval ? "Awaiting Approval" : "Claiming"
                  }
                >
                  Claim
                </Button>
              )}
          </HStack>
          <HStack spacing={4} w="full" alignItems="stretch">
            <StatCard label="Supply" value={supply.toFixed(2)} />
            <StatCard
              _hover={{ cursor: "pointer", opacity: 0.8 }}
              tag="#123"
              tier="Green"
              label="Total Locked"
              value={fiatLocked ? "$" + fiatLocked : "Loading..."}
            />
            <VolumeCard baseMint={tokenBonding.baseMint} />
          </HStack>
          {tokenRef ? (
            <SocialTokenTabs
              onAccountClick={onAccountClick}
              mintKey={mintKey}
              getNftLink={getNftLink}
            />
          ) : (
            <CollectiveTabs
              onAccountClick={onAccountClick}
              tokenBondingKey={tokenBonding.publicKey}
            />
          )}
        </VStack>
      </TokenBondingRecentTransactionsProvider>
    );
  }
);

interface ISocialTokenTabsProps {
  mintKey: PublicKey;
  onAccountClick?: (mintKey: PublicKey) => void;
  getNftLink: (t: ITokenWithMetaAndAccount) => string;
}

function SocialTokenTabs({
  mintKey,
  onAccountClick,
  getNftLink,
}: ISocialTokenTabsProps) {
  const { info: tokenRef, loading } = useMintTokenRef(mintKey);
  const ownerWalletKey = tokenRef?.owner as PublicKey | undefined;

  const {
    data: tokens,
    loading: loadingCollectibles,
    error,
  } = useUserTokensWithMeta(ownerWalletKey);
  const { handleErrors } = useErrorHandler();

  handleErrors(error);

  function isTrophy(t: ITokenWithMetaAndAccount): boolean {
    return Boolean(
      t.data?.properties?.creators?.some(
        // @ts-ignore
        (c) =>
          c.address == TROPHY_CREATOR.toBase58() &&
          (t.data?.attributes || []).some(
            (attr) => attr.trait_type == "is_trophy" && attr.value == "true"
          )
      )
    );
  }

  return (
    <Tabs isFitted w="full">
      <TabList>
        <Tab
          color="gray.300"
          borderColor="gray.300"
          _selected={{ color: "indigo.500", borderColor: "indigo.500" }}
        >
          Backers
        </Tab>
        <Tab
          color="gray.300"
          borderColor="gray.300"
          _selected={{ color: "indigo.500", borderColor: "indigo.500" }}
        >
          Collectibles
        </Tab>
        <Tab
          color="gray.300"
          borderColor="gray.300"
          _selected={{ color: "indigo.500", borderColor: "indigo.500" }}
        >
          Trophies
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel paddingX={0}>
          <TokenLeaderboard onAccountClick={onAccountClick} mintKey={mintKey} />
        </TabPanel>
        <TabPanel paddingX={0}>
          <NftListRaw
            loading={loadingCollectibles}
            tokens={tokens?.filter((t) => !isTrophy(t))}
            getLink={getNftLink}
          />
        </TabPanel>
        <TabPanel paddingX={0}>
          <NftListRaw
            loading={loadingCollectibles}
            tokens={tokens?.filter((t) => isTrophy(t))}
            getLink={getNftLink}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

interface ICollectiveTabsProps {
  tokenBondingKey: PublicKey;
  onAccountClick?: (mintKey: PublicKey) => void;
}
function CollectiveTabs({
  tokenBondingKey,
  onAccountClick,
}: ICollectiveTabsProps) {
  return (
    <Tabs isFitted w="full">
      <TabList>
        <Tab
          color="gray.300"
          borderColor="gray.300"
          _selected={{ color: "indigo.500", borderColor: "indigo.500" }}
        >
          Top Tokens
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel paddingX={0}>
          <TopTokenLeaderboard
            onAccountClick={onAccountClick}
            tokenBondingKey={tokenBondingKey}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
