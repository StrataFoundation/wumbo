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
  useTwitterTokenRef,
} from "wumbo-common";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import { TokenRef } from "spl-wumbo";
import { MintInfo } from "@solana/spl-token";
import { LogCurveV0, TokenBondingV0 } from "spl-token-bonding";

interface UserState {
  tokenRef?: TokenRef;
  loading: boolean;
}

export interface UserInfo {
  name: string;
  coinPriceUsd: number;
  coinPrice: number;
  tokenRef: TokenRef;
  tokenBonding: TokenBondingV0;
  curve: LogCurveV0;
  mint: MintInfo;
}
export interface UserInfoState {
  userInfo?: UserInfo;
  loading: boolean;
}
export const useUserInfo = (name: string): UserInfoState => {
  const { info: creator, loading } = useTwitterTokenRef(name);
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
  const [userInfo, setUserInfo] = useState<UserInfoState>({
    loading: true,
  });
  const { current } = useBondingPricing(creator?.tokenBonding);

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
    } else if (!loading) {
      setUserInfo({ loading: false });
    }
  }, [current, curve, tokenBonding, mint, creator, loading]);

  return userInfo;
};
