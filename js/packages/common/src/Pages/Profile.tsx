import React from "react";
import { AccountInfo as TokenAccountInfo } from "@solana/spl-token";
import { TokenBondingV0 } from "@wum.bo/spl-token-bonding";
import { PublicKey } from "@solana/web3.js";
import {
  ITokenWithMeta,
  supplyAsNum,
  useAssociatedAccount,
  useBondingPricing,
  useFiatPrice,
  useMint,
  useOwnedAmount,
  useQuery,
  useReverseTwitter,
  useTokenMetadata,
  useUserTokensWithMeta,
  useAccount,
  useTokenRefFromBonding,
} from "../utils";
import { StatCard, StatCardWithIcon } from "../StatCard";
import { Badge, Spinner, Button, MetadataAvatar, Tab, Tabs } from "..";
import {
  TokenAccountsContextProvider,
  TokenLeaderboard,
} from "../Leaderboard/TokenLeaderboard";
import { NftList, NftListRaw } from "../Nft";
import { TROPHY_CREATOR } from "../constants/globals";
import { PencilAltIcon } from "@heroicons/react/outline";

interface IProfileProps {
  tokenBondingKey: PublicKey;
  onAccountClick?: (tokenBondingKey: PublicKey) => void;
  onTradeClick?: () => void;
  getNftLink: (t: ITokenWithMeta) => string;
}

export const Profile = React.memo(
  ({
    tokenBondingKey,
    onAccountClick,
    onTradeClick,
    getNftLink,
  }: IProfileProps) => {
    const { info: tokenRef, loading } = useTokenRefFromBonding(tokenBondingKey);
    const ownerWalletKey = tokenRef?.owner;
    const { info: tokenBonding, loading: tokenBondingLoading } = useAccount(
      tokenRef?.tokenBonding,
      TokenBondingV0.fromAccount
    );
    const {
      image,
      metadata,
      loading: loadingMetadata,
    } = useTokenMetadata(tokenBonding?.targetMint);

    const mint = useMint(tokenBonding?.targetMint);
    const supply = mint ? supplyAsNum(mint) : 0;
    const { targetRangeToBasePrice: general, current } = useBondingPricing(
      tokenBonding?.publicKey
    );
    const fiatPrice = useFiatPrice(tokenBonding?.baseMint);
    const toFiat = (a: number) => (fiatPrice || 0) * a;
    const coinPriceUsd = toFiat(current);
    const fiatLocked = mint && toFiat(general(0, supply)).toFixed(2);
    const marketCap = (supply * coinPriceUsd).toFixed(2);

    const {
      result: tokens,
      loading: loadingCollectibles,
      error,
    } = useUserTokensWithMeta(ownerWalletKey);

    const query = useQuery();
    let { handle } = useReverseTwitter(ownerWalletKey);
    if (!handle) {
      handle = query.get("name") || undefined;
    }

    if (loading || tokenBondingLoading || !tokenBonding) {
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
                <PencilAltIcon className="h-5 text-indigo-500 hover:cursor-pointer hover:text-indigo-700" />
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
              <TokenAccountsContextProvider mint={tokenBonding.targetMint}>
                <TokenLeaderboard
                  onAccountClick={onAccountClick}
                  mint={tokenBonding.targetMint}
                />
              </TokenAccountsContextProvider>
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
  }
);
