import { useEffect, useState } from "react";
import { getHashedName, getNameAccountKey } from "@bonfida/spl-name-service";
import {
  WUMBO_INSTANCE_KEY,
  Curve,
  ICurve,
  TokenBonding,
  ITokenBonding,
  ITokenRef,
  TokenRef,
  TWITTER_ROOT_PARENT_REGISTRY_KEY,
  useBondingPricing,
  useWumboUsdPrice,
  useAccount,
  UseAccountState,
  useMint,
  useTwitterTokenRef,
} from "wumbo-common";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import { MintInfo } from "@solana/spl-token";
import { TokenBondingV0 } from "@wum.bo/spl-token-bonding";

interface UserState {
  tokenRef?: ITokenRef;
  loading: boolean;
}

export interface UserInfo {
  name: string;
  coinPriceUsd: number;
  coinPrice: number;
  tokenRef: ITokenRef;
  tokenBonding: TokenBondingV0;
  curve: ICurve;
  mint: MintInfo;
}
export interface UserInfoState {
  userInfo?: UserInfo;
  loading: boolean;
}
export const useUserInfo = (name: string): UserInfoState => {
  const { info: creator, loading } = useTwitterTokenRef(name);
  const { info: tokenBonding, loading: bondingLoading } = useAccount(
    creator?.tokenBonding,
    TokenBonding
  );
  const { info: curve, loading: curveLoading } = useAccount(
    tokenBonding?.curve,
    Curve,
    true
  );
  const mint = useMint(creator && tokenBonding?.targetMint);
  const wumboUsdPrice = useWumboUsdPrice();
  const [userInfo, setUserInfo] = useState<UserInfoState>({
    loading: true,
  });
  const { curve: bondingCurve, loading: pricingLoading } = useBondingPricing(creator?.tokenBonding);
  const current = bondingCurve?.current() || 0;
  
  useEffect(() => {
    if (curve && tokenBonding && mint && creator) {
      setUserInfo({
        userInfo: {
          name,
          tokenRef: creator,
          mint,
          tokenBonding,
          curve,
          coinPrice: current,
          coinPriceUsd: current * (wumboUsdPrice || 0),
        },
        loading: false,
      });
    } else {
      setUserInfo({ loading: loading || bondingLoading || curveLoading || pricingLoading });
    }
  }, [current, curve, tokenBonding, mint, creator, loading, bondingLoading, curveLoading, pricingLoading]);

  return userInfo;
};
