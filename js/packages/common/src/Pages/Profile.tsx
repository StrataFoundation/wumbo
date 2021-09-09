import React from 'react';
import { useTokenRefFromBonding } from '../utils/tokenRef';
import { Spinner } from '../Spinner';
import { useAccount } from '../utils/account';
import { TokenBondingV0 } from "@wum.bo/spl-token-bonding";
import { PublicKey } from '@solana/web3.js';
import { ITokenWithMeta, supplyAsNum, useAssociatedAccount, useBondingPricing, useFiatPrice, useMint, useOwnedAmount, useQuery, useReverseTwitter, useTokenMetadata } from '../utils';
import { StatCard } from "../StatCard";
import { Button, MetadataAvatar, Tab, Tabs } from '..';
import { TokenAccountsContextProvider, TokenLeaderboard } from '../Leaderboard/TokenLeaderboard';
import { AccountInfo as TokenAccountInfo } from '@solana/spl-token';
import { NftList } from '../Nft';

interface IProfileProps { 
  tokenBondingKey: PublicKey;
  onAccountClick?: (tokenBondingKey: PublicKey) => void;
  onTradeClick?: () => void;
  getNftLink: (t: ITokenWithMeta) => string
}

export const Profile = React.memo(({ tokenBondingKey, onAccountClick, onTradeClick, getNftLink }: IProfileProps) => {
  const { info: tokenRef, loading } = useTokenRefFromBonding(tokenBondingKey);
  const ownerWalletKey = tokenRef?.owner;
  const { info: tokenBonding, loading: tokenBondingLoading } = useAccount(tokenRef?.tokenBonding, TokenBondingV0.fromAccount);
  const { image, metadata, loading: loadingMetadata } = useTokenMetadata(tokenBonding?.targetMint);

  const mint = useMint(tokenBonding?.targetMint);
  const supply = mint ? supplyAsNum(mint) : 0;
  const { targetRangeToBasePrice: general, current } = useBondingPricing(
    tokenBonding?.publicKey
  );
  const fiatPrice = useFiatPrice(tokenBonding?.baseMint);
  const toFiat = (a: number) => (fiatPrice || 0) * a;
  const coinPriceUsd = toFiat(current);
  const fiatLocked = mint && toFiat(general(0, supply)).toFixed(2)
  const marketCap = (supply * coinPriceUsd).toFixed(2)
  
  const query = useQuery();
  let { handle } = useReverseTwitter(ownerWalletKey);
  if (!handle) {
    handle = query.get("name") || undefined
  }

  if (loading || tokenBondingLoading || !tokenBonding) {
    return <Spinner />
  }

  return <div className="flex flex-col items-stretch space-y-4">
    <div className="flex flex-col items-center text-gray-700">
      <MetadataAvatar size="xl" tokenBonding={tokenBonding} name="UNCLAIMED" />
      <div className="mt-2 text-lg leading-none">
        { metadata?.data.name || "@" + handle}
      </div>
      <div className="text-sm text-gray-500">
        { metadata ? `${metadata.data.symbol} | @${handle}` : `UNCLAIMED | @${handle}`}
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
      <Tab title="Collectibles">
        <NftList getLink={getNftLink} owner={ownerWalletKey} />
      </Tab>
    </Tabs>
  </div>
})