import { useEffect, useState } from "react";
import { getHashedName, getNameAccountKey } from "@bonfida/spl-name-service";
import {
  WUMBO_INSTANCE_KEY,
  WUMBO_PROGRAM_ID,
  TWITTER_ROOT_PARENT_REGISTRY_KEY,
} from "../constants/globals";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import { WumboCreator } from "../wumbo-api/state";
import { useConnection } from "@oyster/common/lib/contexts/connection";
import { useMint } from "./mintState";
import { usePricing, useWumboUsdPrice } from "./pricing";
import { MintInfo } from "@solana/spl-token";
import { useAccount, UseAccountState } from "./account";
import { LogCurveV0, TokenBondingV0 } from "../spl-token-bonding-api/state";

export const useCreatorKey = (name: string): PublicKey | undefined => {
  const [key, setKey] = useState<PublicKey>();

  useEffect(() => {
    (async () => {
      const hashedName = await getHashedName(name);
      const twitterHandleRegistryKey = await getNameAccountKey(
        hashedName,
        undefined,
        TWITTER_ROOT_PARENT_REGISTRY_KEY
      );
      const [wumboCreatorKey, _] = await PublicKey.findProgramAddress(
        [
          Buffer.from("creator", "utf-8"),
          WUMBO_INSTANCE_KEY.toBuffer(),
          twitterHandleRegistryKey.toBuffer(),
        ],
        WUMBO_PROGRAM_ID
      );

      setKey(wumboCreatorKey);
    })();
  }, [name]);

  return key;
};

interface CreatorState {
  creator?: WumboCreator;
  loading: boolean;
}

export const useCreator = (name: string): UseAccountState<WumboCreator> => {
  const key = useCreatorKey(name);
  const connection = useConnection();

  return useAccount(key, WumboCreator.fromAccount);
};

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
  const { current } = usePricing(creator?.tokenBonding)

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
