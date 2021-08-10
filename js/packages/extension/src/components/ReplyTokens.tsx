import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PublicKey } from "@solana/web3.js";
import { Popover } from "@headlessui/react";
import { usePopper } from "react-popper";
import useResizeAware from "react-resize-aware";
import {
  Avatar,
  IAvatarProps,
  useTwitterTokenRef,
  useOwnedAmountForOwnerAndHandle,
} from "wumbo-common";

const humanizeAmount = (amount: number) => {
  if (amount >= 1) return amount.toFixed(0);

  if (amount < 1) return amount.toFixed(2);
};

interface IMentionTokenProps extends Pick<IAvatarProps, "size"> {
  owner?: PublicKey;
  mention: string;
}

const MentionToken = ({ owner, mention, size }: IMentionTokenProps) => {
  const { info: tokenRef, loading } = useTwitterTokenRef(mention);
  const isClaimed = tokenRef?.is_claimed;
  const isLoading = loading;
  const nullState = (!loading && !tokenRef) || isLoading;

  if (nullState) return null;

  return (
    <div className="wum-flex wum-items-center wum-inline-block wum-rounded-full wum-ring-2 wum-ring-black">
      <Avatar name={(isClaimed && mention) || "UNCLAIMED"} size={size} />
    </div>
  );
};

interface IPopoverTokenProps {
  owner?: PublicKey;
  mention: string;
}

const PopoverToken = ({ owner, mention }: IPopoverTokenProps) => {
  const { info: tokenRef, loading } = useTwitterTokenRef(mention);
  const { amount, loading: loadingAmount } = useOwnedAmountForOwnerAndHandle(owner, mention);
  const isClaimed = tokenRef?.is_claimed;
  const isLoading = loading || loadingAmount;
  const nullState = (!loading && !tokenRef) || (!loadingAmount && !amount) || isLoading;

  if (nullState) return null;

  return (
    <div className="wum-flex wum-justify-between wum-bg-gray-100 wum-p-2 wum-rounded-lg wum-space-x-4">
      <Avatar
        name={(isClaimed && mention) || "UNCLAIMED"}
        subText={`@${mention}`}
        size="xs"
        showDetails
      />
      <span className="wum-ml-8 wum-font-medium wum-text-gray-700">{humanizeAmount(amount!)}</span>
    </div>
  );
};

interface IReplyTokensProps extends Pick<IAvatarProps, "size"> {
  creatorName: string;
  mentions: string[];
}

export const ReplyTokens = ({ creatorName, mentions, size = "xxs" }: IReplyTokensProps) => {
  const { info: tokenRef, loading } = useTwitterTokenRef(creatorName);
  const [refEl, setRefEl] = useState<HTMLButtonElement | null>(null);
  const [popperEl, setPopperEl] = useState<HTMLDivElement | null>(null);
  const [resizeListener, sizes] = useResizeAware();
  const { styles, attributes, forceUpdate } = usePopper(refEl, popperEl);

  useEffect(() => {
    // addjust the position of popover
    // on content load
    if (forceUpdate) {
      forceUpdate();
    }
  }, [sizes.width, sizes.height, forceUpdate]);

  const sanitizedMentions = mentions.map((mention) => mention.replace(/[@ ]/g, ""));

  const nullState = (!loading && !tokenRef) || loading || !tokenRef || !tokenRef.is_claimed;

  if (nullState) return null;

  return (
    <Popover className="wum-flex wum-items-center wum-text-white wum-text-xs wum-mt-2">
      <Popover.Button className="wum-flex wum-items-center wum-space-x-2" ref={setRefEl}>
        <div className="wum-flex wum--space-x-1 wum-overflow-hidden">
          {sanitizedMentions.map((mention) => (
            <MentionToken
              key={`mention${mention}`}
              owner={tokenRef?.owner}
              mention={mention}
              size={size}
            />
          ))}
        </div>
      </Popover.Button>

      {createPortal(
        <Popover.Panel ref={setPopperEl} style={styles.popper} {...attributes.popper}>
          <div
            className="wum-flex wum-flex-col wum-justify-center wum-gap-x-2 wum-gap-y-2 wum-bg-white wum-rounded-lg wum-mt-4 wum-p-2"
            style={{ minWidth: 200 }}
          >
            {resizeListener}
            {sanitizedMentions.map((mention) => (
              <PopoverToken key={`popover${mention}`} owner={tokenRef?.owner} mention={mention} />
            ))}
          </div>
        </Popover.Panel>,
        document.body
      )}
    </Popover>
  );
};
