import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PublicKey } from "@solana/web3.js";
import { Popover } from "@headlessui/react";
import { usePopper } from "react-popper";
import useResizeAware from "react-resize-aware";
import {
  Avatar,
  IAvatarProps,
  useTokenRef,
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
  const { info: tokenRef, loading } = useTokenRef(mention);

  const isClaimed = tokenRef?.is_claimed;
  const isLoading = loading;
  const nullState = (!loading && !tokenRef) || isLoading;

  if (nullState) return null;

  return (
    <div className="flex items-center inline-block rounded-full ring-2 ring-black">
      <Avatar name={(isClaimed && mention) || "UNCLAIMED"} size={size} />
    </div>
  );
};

interface IPopoverTokenProps {
  owner?: PublicKey;
  mention: string;
}

const PopoverToken = ({ owner, mention }: IPopoverTokenProps) => {
  const { info: tokenRef, loading } = useTokenRef(mention);
  const { amount, loading: loadingAmount } = useOwnedAmountForOwnerAndHandle(
    owner,
    mention
  );
  const isClaimed = tokenRef?.is_claimed;
  const isLoading = loading || loadingAmount;
  const nullState =
    (!loading && !tokenRef) || (!loadingAmount && !amount) || isLoading;

  if (nullState) return null;

  return (
    <div className="flex justify-between bg-gray-100 p-2 rounded-lg space-x-4">
      <Avatar
        name={(isClaimed && mention) || "UNCLAIMED"}
        subText={`@${mention}`}
        size="xs"
        showDetails
      />
      <span className="ml-8 font-medium text-gray-700">
        {humanizeAmount(amount!)}
      </span>
    </div>
  );
};

interface IReplyTokensProps extends Pick<IAvatarProps, "size"> {
  creatorName: string;
  mentions: string[];
}

export const ReplyTokens = ({
  creatorName,
  mentions,
  size = "xxs",
}: IReplyTokensProps) => {
  const { info: tokenRef, loading } = useTokenRef(creatorName);
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

  const sanitizedMentions = mentions.map((mention) =>
    mention.replace(/[@ ]/g, "")
  );

  const nullState =
    (!loading && !tokenRef) || loading || !tokenRef || !tokenRef.is_claimed;

  if (nullState) return null;

  return (
    <Popover className="flex items-center text-white text-xs mt-2">
      <Popover.Button className="flex items-center space-x-2" ref={setRefEl}>
        <div className="flex -space-x-1 overflow-hidden">
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
        <Popover.Panel
          ref={setPopperEl}
          style={styles.popper}
          {...attributes.popper}
        >
          <div
            className="flex flex-col justify-center gap-x-2 gap-y-2 bg-white rounded-lg mt-4 p-2"
            style={{ minWidth: 200 }}
          >
            {resizeListener}
            {sanitizedMentions.map((mention) => (
              <PopoverToken
                key={`popover${mention}`}
                owner={tokenRef?.owner}
                mention={mention}
              />
            ))}
          </div>
        </Popover.Panel>,
        document.body
      )}
    </Popover>
  );
};
