import React, { Fragment } from "react";
import { WumboInstance } from "spl-wumbo";
import { useCreatorInfo } from "@/utils/creatorState";
import {
  useWallet,
  useAccount,
  WUMBO_INSTANCE_KEY,
  Avatar,
  IAvatarProps,
} from "wumbo-common";

interface IReplyTokensProps extends Pick<IAvatarProps, "size"> {
  creatorName: string;
  mentions: string[];
}

export const ReplyTokens = React.memo(
  ({ creatorName, mentions, size = "xxs" }: IReplyTokensProps) => {
    const creatorInfoState = useCreatorInfo(creatorName);
    const sanitizeMentions = (mentions: string[]) =>
      mentions.map((mention) => mention.replace("@", ""));
    const { creatorInfo, loading } = creatorInfoState;
    const { wallet } = useWallet();
    const { info: wumboInstance } = useAccount(
      WUMBO_INSTANCE_KEY,
      WumboInstance.fromAccount
    );

    if (!loading && !creatorInfo && wumboInstance && wallet) {
      return null;
    }

    if (loading || !creatorInfo || !wumboInstance) {
      return null;
    }

    return (
      <div className="flex space-x-2 items-center text-white text-xs">
        {sanitizeMentions(mentions).map((mention) => (
          <div className="flex items-center" key={mention}>
            <Avatar name={mention} size={size} />
            <span className="pl-1">12</span>
          </div>
        ))}
      </div>
    );
  }
);
