import {
  amountAsNum,
  useAccount,
  useClaimedTokenRef,
  useMint,
  useSocialTokenMetadata,
  useTokenMetadata,
  useTwitterTokenRef,
} from "../utils";
import React from "react";
import { AccountInfo as TokenAccountInfo, Token } from "@solana/spl-token";
import { Spinner } from "../Spinner";
import { Avatar } from "..";
import { useReverseTwitter } from "../utils/twitter";
import { PublicKey } from "@solana/web3.js";

export const MetadataLeaderboardElement = React.memo(
  ({
    account,
    onClick,
  }: {
    onClick?: (tokenBondingKey: PublicKey) => void;
    account: TokenAccountInfo;
  }) => {
    const { loading, image, metadata, error } = useSocialTokenMetadata(account.owner);
    if (error) {
      console.error(error);
    }

    const { info: tokenRef } = useClaimedTokenRef(account.owner);

    const mint = useMint(account.mint);
    const { handle } = useReverseTwitter(account.owner);

    if (loading || !mint) {
      return <Spinner />;
    }

    const { name, symbol } = (metadata || {}).data || {};

    return (
      <div
        onClick={() => onClick && onClick(tokenRef!.tokenBonding)}
        className="hover:wum-cursor-pointer wum-flex wum-flex-row wum-flex-grow wum-items-center wum-pr-4"
      >
        <div className="wum-py-2 wum-pr-4 wum-pl-1">
          {image && <Avatar size="xs" token imgSrc={image} name={name} />}
        </div>
        <div className="wum-flex-grow wum-flex wum-flex-col wum-min-h-8 wum-justify-center">
          <span
            style={{ maxWidth: "140px" }}
            className="wum-text-sm wum-text-gray-700 wum-overflow-ellipsis wum-overflow-hidden"
          >
            {name ? name : account.owner.toBase58()}
          </span>
          {symbol && handle && (
            <span className="wum-text-xxs wum-font-semibold wum-text-gray-400">
              {symbol} | @{handle}
            </span>
          )}
        </div>
        <div className="wum-flex wum-items-center wum-text-sm wum-font-semibold wum-text-gray-400">
          {amountAsNum(account.amount, mint).toFixed(2)}
        </div>
      </div>
    );
  }
);
