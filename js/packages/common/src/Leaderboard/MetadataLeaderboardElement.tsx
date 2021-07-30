import { amountAsNum, useAccount, useClaimedTokenRef, useMint, useSocialTokenMetadata, useTokenMetadata, useTokenRef } from '../utils';
import React from 'react';
import { AccountInfo as TokenAccountInfo, Token } from "@solana/spl-token";
import { Spinner } from '../Spinner';
import { Avatar } from '..';
import { useReverseTwitter } from '../utils/twitter';

export const MetadataLeaderboardElement = React.memo(({ account, onClick }: { onClick?: (account: TokenAccountInfo) => void, account: TokenAccountInfo }) => {
  const { loading, image, metadata } = useSocialTokenMetadata(account.owner);
  const mint = useMint(account.mint);
  const { handle } = useReverseTwitter(account.owner);

  if (loading || !mint) {
    return <Spinner />
  }

  const { name, symbol } = (metadata || {}).data || {};

  return <div onClick={() => onClick && onClick(account)} className="hover:cursor-pointer flex flex-row flex-grow items-center pr-4">
    <div className="py-2 pr-4 pl-1">
      { image && <Avatar size="xs" token imgSrc={image} name={name} /> }
    </div>
    <div className="flex-grow flex flex-col">
      <span className="text-sm text-gray-700">{ name }</span>
      <span className="text-xxs font-semibold text-gray-400">{ symbol } | @{ handle }</span>
    </div>
    <div className="flex items-center text-sm font-semibold text-gray-400">
      { amountAsNum(account.amount, mint).toFixed(2) }
    </div>
  </div>
})