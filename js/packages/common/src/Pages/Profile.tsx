import React from 'react';
import { useClaimedTokenRef } from '../utils/tokenRef';
import { Spinner } from '../Spinner';
import { useAccount } from '../utils/account';
import { TokenBondingV0 } from "spl-token-bonding";
import { PublicKey } from '@solana/web3.js';
import { supplyAsNum, useAssociatedAccount, useBondingPricing, useFiatPrice, useMint, useOwnedAmount, useReverseTwitter, useTokenMetadata } from '../utils';
import { StatCard } from "../StatCard";
import { Button, MetadataAvatar, Tab, Tabs } from '..';
import { TokenAccountsContextProvider, TokenLeaderboard } from '../Leaderboard/TokenLeaderboard';
import { AccountInfo as TokenAccountInfo } from '@solana/spl-token';

interface IProfileProps { 
  ownerWalletKey: PublicKey;
  onAccountClick?: (account: TokenAccountInfo) => void;
  onTradeClick?: () => void;
}


export const Profile = React.memo(({ ownerWalletKey, onAccountClick, onTradeClick }: IProfileProps) => {
  const { info: tokenRef, loading } = useClaimedTokenRef(ownerWalletKey);
  const { info: tokenBonding, loading: tokenBondingLoading } = useAccount(tokenRef?.tokenBonding, TokenBondingV0.fromAccount);
  const { associatedAccount: account } = useAssociatedAccount(ownerWalletKey, tokenBonding?.targetMint);
  const { image, metadata, loading: loadingMetadata } = useTokenMetadata(tokenBonding?.targetMint);

  const mint = useMint(tokenBonding?.targetMint);
  const supply = mint ? supplyAsNum(mint) : 0;
  const { targetRangeToBasePrice: general, current } = useBondingPricing(
    tokenBonding?.publicKey
  );
  const fiatPrice = useFiatPrice(tokenBonding?.baseMint);
  const toFiat = (a: number) => (fiatPrice || 0) * a;
  const coinPriceUsd = toFiat(current);
  const fiatLocked = mint && (general(0, supply) * coinPriceUsd).toFixed(2)
  const marketCap = (supply * coinPriceUsd).toFixed(2)
  const { handle } = useReverseTwitter(ownerWalletKey);

  if (loading || tokenBondingLoading || !tokenBonding || !account || !metadata) {
    return <Spinner />
  }

  return <div className="flex flex-col items-stretch space-y-4">
    <div className="flex flex-col items-center text-gray-700">
      <MetadataAvatar size="xl" tokenBonding={tokenBonding} />
      <div className="mt-2 text-lg leading-none">
        { metadata.data.name }
      </div>
      <div className="text-sm text-gray-500">
        { metadata.data.symbol } | @{ handle }
      </div>
      <div className="mt-1">
        <Button onClick={onTradeClick} block size="xs" color="secondary">
          <span className="!text-green-800">
            ${coinPriceUsd.toFixed(2)}
          </span>
        </Button>
      </div>
    </div>
    <div className="flex flex-row space-x-4">
      <div className="flex-1">
        <StatCard label="Supply" value={supply.toFixed(2)} />
      </div>
      <div className="flex-1">
        <StatCard label="Total Locked" value={"$" + fiatLocked} />
      </div>
      <div className="flex-1">
        <StatCard label="Market Cap" value={"$" + marketCap} />
      </div>
    </div>
    <Tabs>
      <Tab title="Largest Backers">
        <TokenAccountsContextProvider mint={tokenBonding.targetMint}>
          <TokenLeaderboard onAccountClick={onAccountClick} mint={tokenBonding.targetMint} />
        </TokenAccountsContextProvider>
      </Tab>
    </Tabs>
  </div>
})