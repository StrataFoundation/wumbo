import React, { MutableRefObject, useEffect, useState } from "react";
import ReactShadow from "react-shadow/emotion";
import {
  HStack,
  VStack,
  StackDivider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Text,
  Portal,
  Flex,
} from "@chakra-ui/react";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import {
  ThemeProvider,
  MetadataAvatar,
  AvatarProps,
  truthy,
  getTwitterTld,
  useTwitterTld,
  getTwitterRegistryKey
} from "wumbo-common";
import { SplTokenCollective } from "@strata-foundation/spl-token-collective";
import {
  useStrataSdks,
  useTokenRefForName,
  useOwnedAmountOfNameForOwner,
  getClaimedTokenRefKeyForName,
  getUnclaimedTokenRefKeyForName,
  useAccountFetchCache,
  useErrorHandler,
  useTokenMetadata,
  useTokenBonding,
} from "@strata-foundation/react";
import { AccountFetchCache } from "@strata-foundation/spl-utils";
import { useAsync } from "react-async-hook";
import { NameRegistryState } from "@bonfida/spl-name-service";
import { deserializeUnchecked } from "borsh";

const humanizeAmount = (amount: number) => {
  if (amount >= 1) return amount.toFixed(0);

  if (amount < 1) return amount.toFixed(2);
};

interface IMentionTokenProps extends Pick<AvatarProps, "size"> {
  owner?: PublicKey;
  mention: string;
}

const MentionToken = ({ owner, mention, size }: IMentionTokenProps) => {
  const tld = useTwitterTld();
  const { info: tokenRef, loading: loading1 } = useTokenRefForName(mention, null, tld);
  const { loading: loading2, info: token } = useTokenBonding(
    tokenRef?.tokenBonding
  );
  const { amount, loading: loading3 } = useOwnedAmountOfNameForOwner(
    owner,
    mention,
    null,
    tld
  );

  const isLoading = loading1 || loading2 || loading3;
  const nullState =
    (!isLoading && !tokenRef) || (!isLoading && !amount) || isLoading;

  if (nullState) return null;

  return (
    <MetadataAvatar
      tokenBonding={token}
      name={tokenRef!.name as string}
      size={size}
    />
  );
};

interface IPopoverTokenProps {
  owner?: PublicKey;
  mention: string;
}

const PopoverToken = ({ owner, mention }: IPopoverTokenProps) => {
  const tld = useTwitterTld();
  const { loading: loading1, info: tokenRef } = useTokenRefForName(mention, null, tld);
  const { loading: loading2, info: token } = useTokenBonding(
    tokenRef?.tokenBonding
  );
  const { loading: loading3, metadata } = useTokenMetadata(token?.targetMint);
  const { loading: loading4, amount } = useOwnedAmountOfNameForOwner(
    owner,
    mention,
    null,
    tld
  );

  const isLoading = loading1 || loading2 || loading3 || loading4;
  const nullState =
    (!isLoading && !tokenRef) ||
    (!isLoading && !amount) ||
    (!isLoading && !metadata) ||
    isLoading;

  if (nullState) return null;

  return (
    <HStack padding={2} spacing={2} fontFamily="body">
      <MetadataAvatar
        tokenBonding={token}
        name={tokenRef!.name as string}
        size="md"
      />
      <VStack
        flexGrow={1}
        spacing={0}
        justifyContent="start"
        alignItems="start"
        textAlign="left"
      >
        <Text fontSize="lg" fontWeight="bold">
          {metadata?.data.name}
        </Text>
        <Text fontSize="xs" fontWeight="thin">
          {metadata?.data.symbol}
        </Text>
      </VStack>
      <Flex
        padding={2}
        flexDirection="column"
        rounded="lg"
        bgColor="gray.200"
        justifyContent="center"
        alignItems="center"
        color="gray.700"
        width="68px"
        height="60px"
      >
        <Text isTruncated fontSize="lg" fontWeight="bold">
          {amount?.toFixed(2)}
        </Text>
        <Text isTruncated fontSize="xs" fontWeight="thin">
          {metadata?.data.symbol}
        </Text>
      </Flex>
    </HStack>
  );
};

interface IReplyTokensProps extends Pick<AvatarProps, "size"> {
  creatorName: string;
  mentions: string[];
  outsideRef: React.MutableRefObject<HTMLInputElement>;
}

async function getTwitterRegistry(connection: Connection, twitterHandle: string): Promise<NameRegistryState | undefined> {
  const name = await getTwitterRegistryKey(twitterHandle, await getTwitterTld());
  const acct = await connection.getAccountInfo(name);

  if (acct) {
    return deserializeUnchecked(
      NameRegistryState.schema,
      NameRegistryState,
      acct.data
    );
  }
}

const getTwitterHandle = async (
  connection: Connection,
  twitterHandle: string
): Promise<NameRegistryState | null> => {
  return await getTwitterRegistry(connection, twitterHandle) || null;
};

async function ownsTokensOf(
  owner: PublicKey,
  tokenCollectiveSdk: SplTokenCollective,
  cache: AccountFetchCache,
  mint: PublicKey
): Promise<boolean> {
  const ata = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    owner
  );
  const { info: acct } =
    (await cache.search(ata, tokenCollectiveSdk.tokenRefDecoder)) || {};
  return (acct?.amount.toNumber() || 0) > 0;
}

const getMentionsWithTokens = async (
  owner: PublicKey | undefined,
  tokenCollectiveSdk: SplTokenCollective | undefined,
  cache: AccountFetchCache,
  mentions: string[]
): Promise<string[]> => {
  if (!owner) {
    return [];
  }
  const tld = await getTwitterTld()

  return (
    await Promise.all(
      mentions.map(async (mention) => {
        const handle = await getTwitterHandle(cache.connection, mention);
        if (handle) {
          const claimed = await getClaimedTokenRefKeyForName(
            cache.connection,
            mention,
            null,
            tld
          );
          const unclaimed = await getUnclaimedTokenRefKeyForName(mention, null, tld);
          if (tokenCollectiveSdk) {
            const claimedRef = await cache.search(
              claimed,
              tokenCollectiveSdk.tokenRefDecoder,
              true
            );
            const unclaimedRef = await cache.search(
              unclaimed,
              tokenCollectiveSdk.tokenRefDecoder,
              true
            );
            let tokenRef = claimedRef || unclaimedRef;
            if (
              tokenRef?.info &&
              (await ownsTokensOf(
                owner,
                tokenCollectiveSdk,
                cache,
                tokenRef.info.mint as PublicKey
              ))
            ) {
              return mention;
            }
          }
        }
      })
    )
  ).filter(truthy);
};

export const ReplyTokens = ({
  creatorName,
  mentions,
  size = "xs",
  outsideRef,
}: IReplyTokensProps) => {
  const cache = useAccountFetchCache();
  const { tokenCollectiveSdk } = useStrataSdks();
  const { result: tld } = useAsync(getTwitterTld, []);
  const { info: tokenRef, loading } = useTokenRefForName(
    creatorName,
    null,
    tld
  );
  const {
    result: relevantMentions,
    loading: loadingRelevantMentions,
    error,
  } = useAsync(getMentionsWithTokens, [
    tokenRef?.owner as PublicKey | undefined,
    tokenCollectiveSdk,
    cache,
    mentions,
  ]);
  const { handleErrors } = useErrorHandler();
  handleErrors(error);

  const isLoading = loading || loadingRelevantMentions;
  const mentionTokens = relevantMentions
    ?.map((mention, index) => (
      <MentionToken
        key={`${index}${mention}`}
        mention={mention}
        owner={tokenRef?.owner as PublicKey}
        size={size}
      />
    ))
    .filter(truthy);

  const nullState =
    isLoading ||
    !tokenRef ||
    !tokenRef.isClaimed ||
    !relevantMentions?.length ||
    relevantMentions?.length == 0 ||
    !mentionTokens ||
    mentionTokens?.length == 0;

  if (nullState) return null;

  return (
    <HStack
      fontFamily="body"
      paddingTop={1}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <HStack spacing={-2}>{mentionTokens}</HStack>
      <Popover placement="bottom" trigger="hover">
        <HStack spacing={1} color="gray.500">
          <Text>owns these</Text>
          {relevantMentions!.length > 3 && <Text>tokens and</Text>}
          <PopoverTrigger>
            <Text color="indigo.500" _hover={{ cursor: "pointer" }}>
              {relevantMentions!.length <= 3 && "tokens."}
              {relevantMentions!.length > 3 &&
                `${relevantMentions!.length - 3} more`}
            </Text>
          </PopoverTrigger>
          {relevantMentions!.length > 3 && <Text>too</Text>}
        </HStack>
        <Portal containerRef={outsideRef}>
          <ReactShadow.div>
            <ThemeProvider>
              <PopoverContent rounded="lg">
                <PopoverBody>
                  <VStack
                    divider={<StackDivider borderColor="gray.200" />}
                    align="stretch"
                  >
                    {relevantMentions?.map((mention) => (
                      <PopoverToken
                        key={mention}
                        mention={mention}
                        owner={tokenRef?.owner as PublicKey}
                      />
                    ))}
                  </VStack>
                </PopoverBody>
              </PopoverContent>
            </ThemeProvider>
          </ReactShadow.div>
        </Portal>
      </Popover>
    </HStack>
  );
};
