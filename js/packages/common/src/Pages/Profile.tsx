import React from 'react';
import { useTokenRefFromBonding } from '../utils/tokenRef';
import { Spinner } from '../Spinner';
import { useAccount } from '../utils/account';
import { TokenBonding } from "../utils/deserializers/spl-token-bonding";
import { PublicKey } from '@solana/web3.js';
import { TokenRef, ITokenWithMeta, supplyAsNum, useBondingPricing, useFiatPrice, useMint, useOwnedAmount, useQuery, useReverseTwitter, useTokenMetadata, useUserTokensWithMeta } from '../utils';
import { StatCard } from "../StatCard";
import { Button, MetadataAvatar, Tab, Tabs } from '..';
import { TokenAccountsContextProvider, TokenLeaderboard } from '../Leaderboard/TokenLeaderboard';
import { AccountInfo as TokenAccountInfo } from '@solana/spl-token';
import { NftList, NftListRaw } from '../Nft';
import { TROPHY_CREATOR } from '../constants/globals';

interface IProfileProps { 
  tokenRefKey: PublicKey;
  onAccountClick?: (tokenBondingKey: PublicKey) => void;
  onTradeClick?: () => void;
  getNftLink: (t: ITokenWithMeta) => string
}

export const Profile = React.memo(({ tokenRefKey, onAccountClick, onTradeClick, getNftLink }: IProfileProps) => {
  const { info: tokenRef, loading } = useAccount(tokenRefKey, TokenRef)
  const ownerWalletKey = tokenRef?.owner as PublicKey | undefined;
  const { info: tokenBonding, loading: tokenBondingLoading } = useAccount(tokenRef?.tokenBonding, TokenBonding);
  const { image, metadata, loading: loadingMetadata } = useTokenMetadata(tokenBonding?.targetMint);

  const mint = useMint(tokenBonding?.targetMint);
  const supply = mint ? supplyAsNum(mint) : 0;
  const { curve } = useBondingPricing(
    tokenBonding?.publicKey
  );
  const fiatPrice = useFiatPrice(tokenBonding?.baseMint);
  const toFiat = (a: number) => (fiatPrice || 0) * a;
  const coinPriceUsd = toFiat(curve?.current() || 0);
  const fiatLocked = mint && toFiat(curve?.locked() || 0).toFixed(2)
  const marketCap = (supply * coinPriceUsd).toFixed(2)
  
  const { result: tokens, loading: loadingCollectibles, error } = useUserTokensWithMeta(ownerWalletKey);

  const query = useQuery();
  let { handle } = useReverseTwitter(ownerWalletKey);
  if (!handle) {
    handle = query.get("name") || undefined
  }

  if (loading || tokenBondingLoading || !tokenBonding) {
    return <Spinner />
  }

  function isTrophy(t: ITokenWithMeta): boolean {
    return Boolean(t.data?.properties?.creators?.some(c => c.address == TROPHY_CREATOR.toBase58()))
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
      <Tab title="Backers">
        <TokenAccountsContextProvider mint={tokenBonding.targetMint}>
          <TokenLeaderboard onAccountClick={onAccountClick} mint={tokenBonding.targetMint} />
        </TokenAccountsContextProvider>
      </Tab>
      <Tab title="Collectibles">
        <NftListRaw loading={loadingCollectibles} tokens={tokens?.filter(t => !isTrophy(t))} getLink={getNftLink} />
      </Tab>
      <Tab title="Trophies">
        <NftListRaw loading={loadingCollectibles} tokens={tokens?.filter(t => isTrophy(t))} getLink={getNftLink} />
      </Tab>
    </Tabs>
  </div>
})