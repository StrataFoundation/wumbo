import { amountAsNum, useAccount, useClaimedTokenRef, useClaimedTokenRefKey, useMint, useOwnedAmount, useSocialTokenMetadata, useTokenMetadata, useTwitterTokenRef, useUserOwnedAmount } from '../utils';
import React from 'react';
import { AccountInfo as TokenAccountInfo, Token } from "@solana/spl-token";
import { Spinner } from '../Spinner';
import { Avatar } from '..';
import { useReverseTwitter } from '../utils/twitter';
import { PublicKey } from '@solana/web3.js';
import { handleErrors } from '../contexts';

export const MetadataLeaderboardElement = React.memo(({ mint, wallet, onClick }: { onClick?: (tokenRefKey: PublicKey) => void, wallet: PublicKey, mint: PublicKey }) => {
  const { loading, image, metadata, error } = useSocialTokenMetadata(wallet);
  handleErrors(error);
  const amount = useUserOwnedAmount(wallet, mint)

  const tokenRefKey = useClaimedTokenRefKey(wallet)
  
  const { handle, error: reverseTwitterError } = useReverseTwitter(wallet);
  handleErrors(error, reverseTwitterError);

  if (loading) {
    return <Spinner />
  }

  const { name, symbol } = (metadata || {}).data || {};

  return <div onClick={() => onClick && tokenRefKey && onClick(tokenRefKey)} className="hover:cursor-pointer flex flex-row flex-grow items-center pr-4">
    <div className="py-2 pr-4 pl-1">
      { image && <Avatar size="xs" token imgSrc={image} name={name} /> }
    </div>
    <div className="flex-grow flex flex-col min-h-8 justify-center">
      <span style={{ maxWidth: "140px" }} className="text-sm text-gray-700 overflow-ellipsis overflow-hidden">{ name ? name : wallet.toBase58() }</span>
      { symbol && handle && <span className="text-xxs font-semibold text-gray-400">{ symbol } | @{ handle }</span> }
    </div>
    <div className="flex items-center text-sm font-semibold text-gray-400">
      { amount?.toFixed(2) }
    </div>
  </div>
})