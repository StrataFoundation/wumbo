import { MintInfo } from "@solana/spl-token";
import { useEffect, useMemo, useState } from "react";
import {
  usePriceInUsd,
  useTokenBonding,
  useCurve,
  useBondingPricing,
  useTwitterTokenRef,
  useMint,
} from "@strata-foundation/react";
import { ITokenBonding, ICurve } from "@strata-foundation/spl-token-bonding";
import { ITokenRef } from "@strata-foundation/spl-token-collective";
import { useAsync } from "react-async-hook";
import { getTld } from "wumbo-common";

interface UserState {
  tokenRef?: ITokenRef;
  loading: boolean;
}

export interface UserInfo {
  name: string;
  coinPriceUsd: number;
  coinPrice: number;
  tokenRef: ITokenRef;
  tokenBonding: ITokenBonding;
  curve: ICurve;
  mint: MintInfo;
}
export interface UserInfoState {
  userInfo?: UserInfo;
  loading: boolean;
}

export const useUserInfo = (name: string): UserInfoState => {
  const [result, setResult] = useState<UserInfo | undefined>();
  const { result: tld } = useAsync(getTld, []);
  const { info: creator, loading: loading1 } = useTwitterTokenRef(
    name,
    null,
    tld
  );

  const { info: tokenBonding, loading: loading2 } = useTokenBonding(
    creator?.tokenBonding
  );

  const { info: curve, loading: loading3 } = useCurve(tokenBonding?.curve);

  const mint = useMint(creator && tokenBonding?.targetMint);
  const coinPriceUsd = usePriceInUsd(creator?.mint);

  const { pricing: bondingCurve, loading: loading4 } = useBondingPricing(
    creator?.tokenBonding
  );

  const current = bondingCurve?.current() || 0;
  const loading = useMemo(() => {
    return (
      loading1 ||
      loading2 ||
      loading3 ||
      loading4 ||
      !!(creator && (!tokenBonding || !curve || !bondingCurve))
    );
  }, [
    loading1,
    loading2,
    loading3,
    loading4,
    creator,
    curve,
    bondingCurve,
    tokenBonding,
  ]);

  useEffect(() => {
    if (loading) {
      setResult(undefined);
    }

    if (!loading && curve && tokenBonding && mint && creator) {
      // @ts-ignore
      setResult({
        name,
        tokenRef: creator,
        mint,
        tokenBonding,
        curve,
        coinPrice: current,
        coinPriceUsd,
      });
    }
  }, [setResult, current, curve, tokenBonding, mint, creator, loading]);

  return { loading, userInfo: result };
};
