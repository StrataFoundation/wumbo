import { amountAsNum, useAccount, useClaimedTokenRef, useClaimedTokenRefKey, useMint, useSocialTokenMetadata, useTokenMetadata, useTwitterTokenRef } from '../utils';
import React from 'react';
import { AccountInfo as TokenAccountInfo, Token } from "@solana/spl-token";
import { Spinner } from '../Spinner';
import { Avatar } from '..';
import { useReverseTwitter } from '../utils/twitter';
import { PublicKey } from '@solana/web3.js';

export const MetadataLeaderboardElement = React.memo(({ account, onClick }: { onClick?: (tokenRefKey: PublicKey) => void, account: TokenAccountInfo }) => {
  const { loading, image, metadata, error } = useSocialTokenMetadata(account.owner);
  if (error) {
    console.error(error);
  }

  const tokenRefKey = useClaimedTokenRefKey(account.owner)
  
  const mint = useMint(account.mint);
  const { handle } = useReverseTwitter(account.owner);

  if (loading || !mint) {
    return <Spinner />
  }

  const { name, symbol } = (metadata || {}).data || {};

  return <div onClick={() => onClick && tokenRefKey && onClick(tokenRefKey)} className="hover:cursor-pointer flex flex-row flex-grow items-center pr-4">
    <div className="py-2 pr-4 pl-1">
      { image && <Avatar size="xs" token imgSrc={image} name={name} /> }
    </div>
    <div className="flex-grow flex flex-col min-h-8 justify-center">
      <span style={{ maxWidth: "140px" }} className="text-sm text-gray-700 overflow-ellipsis overflow-hidden">{ name ? name : account.owner.toBase58() }</span>
      { symbol && handle && <span className="text-xxs font-semibold text-gray-400">{ symbol } | @{ handle }</span> }
    </div>
    <div className="flex items-center text-sm font-semibold text-gray-400">
      { amountAsNum(account.amount, mint).toFixed(2) }
    </div>
  </div>
})