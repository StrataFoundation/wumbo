import { useEffect, useState } from "react";
import { getHashedName, getNameAccountKey } from "@bonfida/spl-name-service";
import {
  WUMBO_INSTANCE_KEY,
  WUMBO_PROGRAM_ID,
  TWITTER_ROOT_PARENT_REGISTRY_KEY,
  useBondingPricing, 
  useWumboUsdPrice,
  useAccount, 
  UseAccountState,
  useMint,
  useCreator
} from "wumbo-common";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import { WumboCreator } from "spl-wumbo";
import { MintInfo } from "@solana/spl-token";
import { LogCurveV0, TokenBondingV0 } from "spl-token-bonding";

interface CreatorState {
  creator?: WumboCreator;
  loading: boolean;
}

export interface CreatorInfo {
  name: string;
  coinPriceUsd: number;
  coinPrice: number;
  creator: WumboCreator;
  tokenBonding: TokenBondingV0;
  curve: LogCurveV0;
  mint: MintInfo;
}
export interface CreatorInfoState {
  creatorInfo?: CreatorInfo;
  loading: boolean;
}
export const useCreatorInfo = (name: string): CreatorInfoState => {
  const { info: creator, loading } = useCreator(name);
  const { info: tokenBonding } = useAccount(
    creator?.tokenBonding,
    TokenBondingV0.fromAccount
  );
  const { info: curve } = useAccount(
    tokenBonding?.curve,
    LogCurveV0.fromAccount
  );
  const mint = useMint(creator && tokenBonding?.targetMint);
  const wumboUsdPrice = useWumboUsdPrice();
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfoState>({
    loading: true,
  });
  const { current } = useBondingPricing(creator?.tokenBonding);

  useEffect(() => {
    if (curve && tokenBonding && mint && creator) {
      setCreatorInfo({
        creatorInfo: {
          name,
          creator,
          mint,
          tokenBonding,
          curve,
          coinPrice: current,
          coinPriceUsd: current * (wumboUsdPrice || 0),
        },
        loading: false,
      });
    } else if (!loading) {
      setCreatorInfo({ loading: false });
    }
  }, [current, curve, tokenBonding, mint, creator, loading]);

  return creatorInfo;
};
