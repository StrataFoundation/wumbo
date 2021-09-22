import React, { MutableRefObject, useEffect, useState } from "react";
import ReactShadow from "react-shadow/emotion";
import {
  HStack,
  Popover,
  PopoverTrigger,
  PopoverHeader,
  PopoverContent,
  PopoverBody,
  Text,
  Portal,
} from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import {
  ThemeProvider,
  MetadataAvatar,
  AvatarProps,
  useTwitterTokenRef,
  useOwnedAmountForOwnerAndHandle,
  getTwitterHandle,
  getTwitterClaimedTokenRefKey,
  getTwitterUnclaimedTokenRefKey,
  truthy,
  useConnection,
  useAccountFetchCache,
  handleErrors,
} from "wumbo-common";
import { AccountFetchCache } from "@/../../common/dist/lib/utils/accountFetchCache/accountFetchCache";
import { useAsync } from "react-async-hook";

const humanizeAmount = (amount: number) => {
  if (amount >= 1) return amount.toFixed(0);

  if (amount < 1) return amount.toFixed(2);
};

interface IMentionTokenProps extends Pick<AvatarProps, "size"> {
  owner?: PublicKey;
  mention: string;
}

const MentionToken = ({ owner, mention, size }: IMentionTokenProps) => {
  const { info: tokenRef, loading } = useTwitterTokenRef(mention);
  const { amount, loading: loadingAmount } = useOwnedAmountForOwnerAndHandle(
    owner,
    mention
  );

  const isClaimed = tokenRef?.isClaimed;
  const isLoading = loading || loadingAmount;
  const nullState =
    (!loading && !tokenRef) || (!loadingAmount && !amount) || isLoading;

  if (nullState) return null;

  return (
    <MetadataAvatar
      tokenBonding={tokenRef!.tokenBonding}
      name={tokenRef!.name as string}
      size={size}
    />
  );
};

interface IReplyTokensProps extends Pick<AvatarProps, "size"> {
  creatorName: string;
  mentions: string[];
  outsideRef: React.MutableRefObject<HTMLInputElement>;
}

const getMentionsWithTokens = async (
  cache: AccountFetchCache,
  mentions: string[]
): Promise<string[]> => {
  return (
    await Promise.all(
      mentions.map(async (mention) => {
        const handle = await getTwitterHandle(cache.connection, mention);
        if (handle) {
          const claimed = await getTwitterClaimedTokenRefKey(
            cache.connection,
            mention
          );
          const unclaimed = await getTwitterUnclaimedTokenRefKey(mention);
          const claimedRef = await cache.search(claimed, undefined, true);
          if (claimedRef) {
            return mention;
          }

          const unclaimedRef = await cache.search(unclaimed, undefined, true);
          if (unclaimedRef) {
            return mention;
          }
        }
      })
    )
  ).filter(truthy);
};

// take creator and mentions
// 1) find what mentions have social tokens (done)
// 2) find of those social tokens if the creator owns them
// 3) display max 3 then x more with popover
// 4) all shuld be in popover
export const ReplyTokens = ({
  creatorName,
  mentions,
  size = "xs",
  outsideRef,
}: IReplyTokensProps) => {
  const cache = useAccountFetchCache();
  const { info: tokenRef, loading } = useTwitterTokenRef(creatorName);
  const {
    result: relevantMentions,
    loading: loadingRelevantMentions,
    error,
  } = useAsync(getMentionsWithTokens, [cache, mentions]);
  handleErrors(error);

  const isLoading = loading || loadingRelevantMentions;

  console.log("relevantMentions", relevantMentions);

  const nullState = isLoading || !tokenRef || !tokenRef.isClaimed;

  if (nullState) return null;

  return (
    <HStack fontFamily="body">
      <HStack spacing={-2}>
        {relevantMentions?.map((mention) => (
          <MentionToken
            key={mention}
            mention={mention}
            owner={tokenRef?.owner as PublicKey}
            size={size}
          />
        ))}
      </HStack>
      <Popover isLazy placement="bottom" trigger="hover">
        <HStack spacing={1} color="gray.500">
          <Text>owns these tokens and</Text>
          <PopoverTrigger>
            <Text color="indigo.500" _hover={{ cursor: "pointer" }}>
              x others
            </Text>
          </PopoverTrigger>
          <Text>too</Text>
        </HStack>
        <Portal containerRef={outsideRef}>
          <ReactShadow.div>
            <ThemeProvider>
              <PopoverContent>
                <PopoverHeader fontWeight="bold">
                  Social Tokens {creatorName} Owns!
                </PopoverHeader>
                <PopoverBody>// avatars with name and ownings here</PopoverBody>
              </PopoverContent>
            </ThemeProvider>
          </ReactShadow.div>
        </Portal>
      </Popover>
    </HStack>
  );
};
