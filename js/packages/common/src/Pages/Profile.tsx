import React from 'react';
import { useClaimedTokenRef, useTokenRefFromBonding } from '../utils/tokenRef';
import { Spinner } from '../Spinner';
import { useAccount } from '../utils/account';
import { TokenBonding } from "../utils/deserializers/spl-token-bonding";
import { PublicKey } from '@solana/web3.js';
import { TokenRef, ITokenWithMeta, supplyAsNum, useBondingPricing, useFiatPrice, useMint, useOwnedAmount, useQuery, useReverseTwitter, useTokenMetadata, useUserTokensWithMeta, useClaimLink } from '../utils';
import { StatCard, StatCardWithIcon } from "../StatCard";
import { Badge, Button, MetadataAvatar, Tab, Tabs, useWallet } from '..';
import { PencilAltIcon } from '@heroicons/react/outline';
import { TokenLeaderboard } from '../Leaderboard/TokenLeaderboard';
import { AccountInfo as TokenAccountInfo } from '@solana/spl-token';
import { NftList, NftListRaw } from '../Nft';
import { TROPHY_CREATOR } from '../constants/globals';
import { Link } from 'react-router-dom';
import { handleErrors } from '../contexts';

interface IProfileProps {
  tokenRefKey: PublicKey;
  editPath: string;
  onAccountClick?: (tokenRefKey: PublicKey) => void;
  onTradeClick?: () => void;
  getNftLink: (t: ITokenWithMeta) => string
  useClaimFlow: (handle: string | undefined | null) => IClaimFlowOutput
}

export interface IClaimFlowOutput {
  error: Error | undefined;
  loading: boolean;
  claim: () => void
}

export const Profile = React.memo(({ useClaimFlow, tokenRefKey, onAccountClick, onTradeClick, getNftLink, editPath }: IProfileProps) => {
  const { info: tokenRef, loading } = useAccount(tokenRefKey, TokenRef, true)
  const ownerWalletKey = tokenRef?.owner as PublicKey | undefined;
  const { info: walletTokenRef } = useClaimedTokenRef(ownerWalletKey);
  const { info: tokenBonding, loading: tokenBondingLoading } = useAccount(tokenRef?.tokenBonding, TokenBonding);
  const { metadata, loading: loadingMetadata, error: tokenMetadataError } = useTokenMetadata(tokenBonding?.targetMint);
  const { publicKey } = useWallet();
  const { handle: walletTwitterHandle, error: reverseTwitterError } = useReverseTwitter(publicKey || undefined);
  
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
  let { handle, error: reverseTwitterError2 } = useReverseTwitter(ownerWalletKey);
  if (!handle) {
    handle = query.get("name") || undefined
  }
  const { claim, loading: claiming } = useClaimFlow(handle);
  handleErrors(error, reverseTwitterError, reverseTwitterError2, tokenMetadataError);

  if (loading || tokenBondingLoading || !tokenBonding || loadingMetadata) {
    return <Spinner />;
  }

  function isTrophy(t: ITokenWithMeta): boolean {
    return Boolean(
      t.data?.properties?.creators?.some(
        (c) => c.address == TROPHY_CREATOR.toBase58()
      )
    );
  }

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex flex-col">
        <div className="flex w-full justify-between">
          <div className="flex flex-col gap-2.5">
            <MetadataAvatar
              size="xl"
              tokenBonding={tokenBonding}
              name="UNCLAIMED"
            />
            <div className="flex gap-2 items-center">
              <p className="text-xl leading-none">
                {metadata?.data.name || "@" + handle}
              </p>
              {walletTokenRef &&
                <Link to={editPath}>
                  <PencilAltIcon className="h-5 text-indigo-500 hover:cursor-pointer hover:text-indigo-700" />
                </Link>}
            </div>
            <p className="text-sm">
              {" "}
              {metadata
                ? `${metadata.data.symbol} | @${handle}`
                : `UNCLAIMED | @${handle}`}
            </p>
            <div className="flex gap-2">
              <Button size="xs" onClick={onTradeClick}>
                Trade
              </Button>
              <Badge
                size="sm"
                color="secondary"
                className="!text-white"
                onClick={onTradeClick}
              >
                ${coinPriceUsd.toFixed(2)}
              </Badge>
              { tokenRef && !tokenRef.isClaimed && !walletTokenRef && (!walletTwitterHandle || walletTwitterHandle == handle) && <Button
                onClick={claim}
                size="xs" 
                color="twitterBlue"
                disabled={claiming}
              >
                { claiming && "Claiming" }
                { !claiming && "Claim" }
              </Button>}
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <StatCardWithIcon icon="coin" label="coin rank" value="TBD" />
            <StatCardWithIcon icon="wumbo" label="WUM locked" value="TBD" />
          </div>
        </div>
      </div>
      <div className="flex space-x-4">
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
      <div>
        <Tabs>
          <Tab title="Backers">
            <TokenLeaderboard
              onAccountClick={onAccountClick}
              mint={tokenBonding.targetMint}
            />
          </Tab>
          <Tab title="Collectibles">
            <NftListRaw
              loading={loadingCollectibles}
              tokens={tokens?.filter((t) => !isTrophy(t))}
              getLink={getNftLink}
            />
          </Tab>
          <Tab title="Trophies">
            <NftListRaw
              loading={loadingCollectibles}
              tokens={tokens?.filter((t) => isTrophy(t))}
              getLink={getNftLink}
            />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
});

