import React from "react";
import { Link } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
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
  Link as PlainLink
} from "@chakra-ui/react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { useClaimedTokenRef, useClaimedTokenRefKey } from "../utils/tokenRef";
import { Spinner } from "../Spinner";
import { useAccount } from "../utils/account";
import { TokenBonding } from "../utils/deserializers/spl-token-bonding";
import {
  TokenRef,
  ITokenWithMeta,
  supplyAsNum,
  useBondingPricing,
  useFiatPrice,
  useMint,
  useOwnedAmount,
  useQuery,
  useReverseTwitter,
  useTokenMetadata,
  useUserTokensWithMeta,
  useClaimLink,
} from "../utils";
import { StatCard, StatCardWithIcon } from "../StatCard";
import { MetadataAvatar, useWallet } from "..";
import { TokenLeaderboard } from "../Leaderboard/TokenLeaderboard";
import { NftListRaw } from "../Nft";
import { TROPHY_CREATOR } from "../constants/globals";
import { handleErrors } from "../contexts";
import { useQuery as apolloUseQuery, gql } from "@apollo/client";

interface IProfileProps {
  tokenRefKey: PublicKey;
  editPath: string;
  onAccountClick?: (tokenRefKey: PublicKey) => void;
  onTradeClick?: () => void;
  getNftLink: (t: ITokenWithMeta) => string;
  useClaimFlow: (handle: string | undefined | null) => IClaimFlowOutput;
}

export interface IClaimFlowOutput {
  error: Error | undefined;
  loading: boolean;
  claim: () => void;
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
  }: IProfileProps) => {
    const { info: tokenRef, loading } = useAccount(tokenRefKey, TokenRef, true);
    const ownerWalletKey = tokenRef?.owner as PublicKey | undefined;
    const { info: walletTokenRef } = useClaimedTokenRef(ownerWalletKey);
    const { info: tokenBonding, loading: tokenBondingLoading } = useAccount(
      tokenRef?.tokenBonding,
      TokenBonding
    );
    const {
      metadata,
      loading: loadingMetadata,
      error: tokenMetadataError,
    } = useTokenMetadata(tokenBonding?.targetMint);
    const { publicKey, awaitingApproval } = useWallet();
    const myTokenRefKey = useClaimedTokenRefKey(publicKey || undefined);
    const { handle: walletTwitterHandle, error: reverseTwitterError } =
      useReverseTwitter(publicKey || undefined);
    const { data: { wumRank } = {} } = apolloUseQuery<{
      wumRank: number | undefined;
    }>(GET_WUM_RANK, { variables: { wallet: ownerWalletKey?.toBase58() } });
    const { data: { tokenRank } = {} } = apolloUseQuery<{
      tokenRank: number | undefined;
    }>(GET_TOKEN_RANK, {
      variables: { tokenBonding: tokenRef?.tokenBonding.toBase58() },
    });

    const mint = useMint(tokenBonding?.targetMint);
    const supply = mint ? supplyAsNum(mint) : 0;
    const { curve } = useBondingPricing(tokenBonding?.publicKey);
    const fiatPrice = useFiatPrice(tokenBonding?.baseMint);
    const toFiat = (a: number) => (fiatPrice || 0) * a;
    const coinPriceUsd = toFiat(curve?.current() || 0);
    const fiatLocked = mint && toFiat(curve?.locked() || 0).toFixed(2);
    const marketCap = (supply * coinPriceUsd).toFixed(2);

    const {
      result: tokens,
      loading: loadingCollectibles,
      error,
    } = useUserTokensWithMeta(ownerWalletKey);

    const query = useQuery();
    let { handle, error: reverseTwitterError2 } =
      useReverseTwitter(ownerWalletKey);
    if (!handle) {
      handle = query.get("name") || undefined;
    }
    const { claim, loading: claiming, error: claimError } = useClaimFlow(handle);
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

    function isTrophy(t: ITokenWithMeta): boolean {
      return Boolean(
        t.data?.properties?.creators?.some(
          // @ts-ignore
          (c) => c.address == TROPHY_CREATOR.toBase58() && (t.data?.attributes || []).some(attr => attr.trait_type == "is_trophy" && attr.value == "true")
        )
      );
    }

    const handleLink = <PlainLink href={`https://twitter.com/${handle}`}>@{handle}</PlainLink> 
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
                {metadata?.data.name || handleLink }
              </Text>
              {myTokenRefKey && walletTokenRef?.publicKey.equals(myTokenRefKey) && (
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
            {metadata && <Text fontSize="14px">
              {metadata.data.symbol} |&nbsp;{handleLink}
            </Text>}
            {!metadata &&
              <Text fontSize="14px">
                UNCLAIMED |&nbsp;{handleLink}
              </Text>
            }
          </VStack>
          <Spacer />
          <VStack spacing={2}>
            <StatCardWithIcon
              icon="coin"
              label="Token Rank"
              value={
                typeof tokenRank != undefined && tokenRank != null ? (tokenRank! + 1).toString() : ""
              }
            />
            { tokenRef?.isClaimed && <StatCardWithIcon
              icon="wumbo"
              label="WUM Locked"
              value={
                typeof wumRank != undefined && wumRank != null ? (wumRank! + 1).toString() : ""
              }
            /> }
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
                loadingText={awaitingApproval ? "Awaiting Approval" : "Claiming"}
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
                mint={tokenBonding.targetMint}
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
