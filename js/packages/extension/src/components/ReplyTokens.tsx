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
  useUserTokensWithMeta,
  WUMBO_INSTANCE_KEY,
} from "wumbo-common";

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

export const ReplyTokens = ({
  creatorName,
  mentions,
  size = "xs",
}: IReplyTokensProps) => {
  const { info: tokenRef, loading } = useTwitterTokenRef(creatorName);
  const { result: tokens, loading: loadingTokens } = useUserTokensWithMeta(
    tokenRef?.owner as PublicKey
  );

  const isLoading = loading || loadingTokens;

  const sanitizedMentions = [
    ...new Set(mentions.map((mention) => mention.replace(/[@ ]/g, ""))),
  ];

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
