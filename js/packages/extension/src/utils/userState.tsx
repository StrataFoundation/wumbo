import { useEffect, useState } from "react";
import {
  Curve,
  ICurve,
  TokenBonding,
  ITokenRef,
  useBondingPricing,
  useWumboUsdPrice,
  useAccount,
  useMint,
  useTwitterTokenRef,
} from "wumbo-common";
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [result, setResult] = useState<UserInfo | undefined>();
  const { info: creator, loading: loading1 } = useTwitterTokenRef(name);

  const { info: tokenBonding, loading: loading2 } = useAccount(
    creator?.tokenBonding,
    TokenBonding
  );

  const { info: curve, loading: loading3 } = useAccount(
    tokenBonding?.curve,
    Curve,
    true
  );

  const mint = useMint(creator && tokenBonding?.targetMint);
  const wumboUsdPrice = useWumboUsdPrice();

  const { curve: bondingCurve, loading: loading4 } = useBondingPricing(
    creator?.tokenBonding
  );

  const current = bondingCurve?.current() || 0;


  useEffect(() => {
    const loading = loading1 || loading2 || loading3 || loading4;
    if (loading != isLoading) setIsLoading(loading)

    if (curve && tokenBonding && mint && creator) {
      // @ts-ignore
      setResult({
        name,
        tokenRef: creator,
        mint,
        tokenBonding,
        curve,
        coinPrice: current,
        coinPriceUsd: current * (wumboUsdPrice || 0),
      });
    }
  }, [
    setResult,
    setIsLoading,
    current,
    curve,
    tokenBonding,
    mint,
    creator,
    loading1,
    loading2,
    loading3,
    loading4,
  ]);

  return { loading: isLoading, userInfo: result };
};
