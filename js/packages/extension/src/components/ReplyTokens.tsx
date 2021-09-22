import React, { useEffect, useState } from "react";
import { HStack, Avatar } from "@chakra-ui/react";
/* import { createPortal } from "react-dom"; */
import { PublicKey } from "@solana/web3.js";
/* import { Popover } from "@headlessui/react"; */
/* import { usePopper } from "react-popper"; */
/* import useResizeAware from "react-resize-aware"; */
import {
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
import { getTwitterRegistryKey } from "@bonfida/spl-name-service";
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

interface IPopoverTokenProps {
  owner?: PublicKey;
  mention: string;
}

const PopoverToken = ({ owner, mention }: IPopoverTokenProps) => {
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
    <div className="flex justify-between bg-gray-100 p-2 rounded-lg space-x-4">
      <MetadataAvatar
        tokenBonding={tokenRef!.tokenBonding}
        name={tokenRef!.name as string}
        size="xs"
      />
      <span className="ml-8 font-medium text-gray-700">
        {humanizeAmount(amount!)}
      </span>
    </div>
  );
};

interface IReplyTokensProps extends Pick<AvatarProps, "size"> {
  creatorName: string;
  mentions: string[];
}

async function getMentionsWithTokens(cache: AccountFetchCache, mentions: string[]): Promise<string[]> {
  return (await Promise.all(mentions.map(async mention => {
    const handle = await getTwitterHandle(cache.connection, mention)
    if (handle) {
      const claimed = await getTwitterClaimedTokenRefKey(cache.connection, mention)
      const unclaimed = await getTwitterUnclaimedTokenRefKey(mention);
      const claimedRef = await cache.search(claimed, undefined, true);
      if (claimedRef) {
        return mention
      }

      const unclaimedRef = await cache.search(unclaimed, undefined, true);
      if (unclaimedRef) {
        return mention
      }
    }
  }))).filter(truthy)
}

export const ReplyTokens = ({
  creatorName,
  mentions,
  size = "xs",
}: IReplyTokensProps) => {
  const { info: tokenRef, loading } = useTwitterTokenRef(creatorName);
  /* const [refEl, setRefEl] = useState<HTMLButtonElement | null>(null);
   * const [popperEl, setPopperEl] = useState<HTMLDivElement | null>(null); */
  const sanitizedMentions = [
    ...new Set(mentions.map((mention) => mention.replace(/[@ ]/g, ""))),
  ];
  const cache = useAccountFetchCache();
  const { result: relevantMentions, error } = useAsync(getMentionsWithTokens, [cache, mentions])
  handleErrors(error)

  if (relevantMentions?.length > 0) {
    debugger;
  }
  const nullState =
    (!loading && !tokenRef) || loading || !tokenRef || !tokenRef.isClaimed;

  if (nullState) return null;

  return (
    <HStack spacing={-2}>
      {sanitizedMentions.map((mention) => (
        <MentionToken
          key={mention}
          mention={mention}
          owner={tokenRef?.owner as PublicKey}
          size={size}
        />
      ))}
    </HStack>
  );
};
