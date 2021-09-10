import { PublicKey } from '@solana/web3.js';
import { useWallet } from '../contexts/walletContext';
import { NftCard } from './NftCard';
import React from 'react';
import { Spinner } from '../Spinner';
import { ITokenWithMeta, useUserTokensWithMeta } from "../utils";

export const NftList = React.memo(({ owner, getLink }: { owner?: PublicKey, getLink: (t: ITokenWithMeta) => string }) => {
  const { result: tokens, loading, error } = useUserTokensWithMeta(owner);

  if (!tokens || loading) {
    return <Spinner />;
  }
  
  return <div className="flex flex-row flex-wrap gap-4">
    { tokens.filter(t => t.masterEdition).map(token => 
      <NftCard key={token.publicKey?.toBase58()} getLink={getLink} token={token} />
    )}
  </div>
}); 

