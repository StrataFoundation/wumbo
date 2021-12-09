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
} from "@strata-foundation/react";
import { ITokenWithMetaAndAccount } from "@strata-foundation/spl-token-collective";
import { Spinner } from "../Spinner";
import { useQuery, useReverseTwitter } from "../utils";
import { useUserTokensWithMeta } from "../hooks";
import { StatCard, StatCardWithIcon } from "../StatCard";
import { MetadataAvatar } from "..";
import { TokenLeaderboard } from "../Leaderboard/TokenLeaderboard";
import { NftListRaw } from "../Nft";
import { TROPHY_CREATOR } from "../constants/globals";
import { useWallet } from "@solana/wallet-adapter-react";
import { NATIVE_MINT } from "@solana/spl-token";

interface IProfileProps {
  tokenRefKey: PublicKey;
  editPath: string;
  topTokensPath: string;
  wumNetWorthPath: string;
  onAccountClick?: (tokenRefKey: PublicKey) => void;
  onTradeClick?: () => void;
  getNftLink: (t: ITokenWithMetaAndAccount) => string;
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

export const Profile = React.memo(
  ({
    useClaimFlow,
    tokenRefKey,
    onAccountClick,
    onTradeClick,
    getNftLink,
    editPath,
    topTokensPath,
    wumNetWorthPath,
  }: IProfileProps) => {
    const { handleErrors } = useErrorHandler();
    const { info: tokenRef, loading } = useTokenRef(tokenRefKey);
    const ownerWalletKey = tokenRef?.owner as PublicKey | undefined;
    const { info: walletTokenRef } = usePrimaryClaimedTokenRef(ownerWalletKey);
    const { info: tokenBonding, loading: tokenBondingLoading } =
      useTokenBonding(tokenRef?.tokenBonding);
    const {
      metadata,
      loading: loadingMetadata,
      error: tokenMetadataError,
    } = useTokenMetadata(tokenBonding?.targetMint);
    const { awaitingApproval } = useProvider();
    const { adapter } = useWallet();
    const publicKey = adapter?.publicKey;
    const myTokenRefKey = useClaimedTokenRefKey(publicKey, null);
    const { handle: walletTwitterHandle, error: reverseTwitterError } =
      useReverseTwitter(publicKey || undefined);
    const { data: { wumRank } = {} } = apolloUseQuery<{
      wumRank: number | undefined;
    }>(GET_WUM_RANK, { variables: { wallet: ownerWalletKey?.toBase58() } });
    const { data: { tokenRank } = {} } = apolloUseQuery<{
      tokenRank: number | undefined;
    }>(GET_TOKEN_RANK, {
      variables: { tokenBonding: tokenRef?.tokenBonding?.toBase58() },
    });

    const mint = useMint(tokenBonding?.targetMint);
    const supply = mint ? supplyAsNum(mint) : 0;
    const { pricing } = useBondingPricing(tokenBonding?.publicKey);
    const fiatPrice = usePriceInUsd(tokenBonding?.baseMint);
    const toFiat = (a: number) => (fiatPrice || 0) * a;
    const coinPriceUsd = toFiat(pricing?.current(NATIVE_MINT) || 0);
    const fiatLocked =
      mint && toFiat(pricing?.locked(NATIVE_MINT) || 0).toFixed(2);
    const marketCap = (supply * coinPriceUsd).toFixed(2);

    const {
      data: tokens,
      loading: loadingCollectibles,
      error,
    } = useUserTokensWithMeta(ownerWalletKey);

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
      error,
      reverseTwitterError,
      reverseTwitterError2,
      tokenMetadataError
    );

    if (loading || tokenBondingLoading || !tokenBonding || loadingMetadata) {
      return <Spinner />;
    }

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

    const handleLink = (
      <PlainLink href={`https://twitter.com/${handle}`}>@{handle}</PlainLink>
    );
    return (
      <VStack spacing={4} padding={4}>
        <HStack spacing={2} w="full" alignItems="start">
          <VStack spacing={2} alignItems="start">
            <MetadataAvatar
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
                  <Link to={editPath}>
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
          <VStack spacing={2}>
            <Link to={topTokensPath}>
              <StatCardWithIcon
                icon="coin"
                label="Token Rank"
                value={
                  typeof tokenRank != undefined && tokenRank != null
                    ? (tokenRank! + 1).toString()
                    : ""
                }
              />
            </Link>
            {tokenRef?.isClaimed && (
              <Link to={wumNetWorthPath}>
                <StatCardWithIcon
                  icon="wumbo"
                  label="Net Worth"
                  value={
                    typeof wumRank != undefined && wumRank != null
                      ? (wumRank! + 1).toString()
                      : ""
                  }
                />
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
        <HStack spacing={4} w="full">
          <StatCard label="Supply" value={supply.toFixed(2)} />
          <StatCard label="Total Locked" value={"$" + fiatLocked} />
          <StatCard label="Market Cap" value={"$" + marketCap} />
        </HStack>
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
              <TokenLeaderboard
                onAccountClick={onAccountClick}
                mintKey={tokenBonding.targetMint}
              />
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
      </VStack>
    );
  }
);
