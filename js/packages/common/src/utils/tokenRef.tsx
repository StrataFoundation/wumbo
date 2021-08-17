import { useEffect, useMemo, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useConnection } from "@oyster/common";
import { useAccount, UseAccountState } from "./account";
import { TokenRef, Wumbo } from "@wum.bo/spl-wumbo";
import { useAsync, useAsyncCallback } from "react-async-hook";
import { TokenBondingV0 } from "@wum.bo/spl-token-bonding";
import { TokenMetadata, useTokenMetadata } from "./metaplex/hooks";
import { getWumbo } from "../constants/wumbo";

export function useWumbo(): Wumbo | undefined {
  const { result } = useAsync(getWumbo, []);

  return result;
}

export const useUnclaimedTwitterTokenRefKey = (name: string | undefined): PublicKey | undefined => {
  const connection = useConnection();
  const wumbo = useWumbo()
  const { result: key } = useAsync(async (wumbo: Wumbo | undefined, name: string | undefined) => {
      if (connection && name && wumbo) {
        return wumbo.getTwitterUnclaimedTokenRefKey(name)
      }
    },
    [wumbo, name]
  )
  return key;
};


export const useClaimedTwitterTokenRefKey = (name: string | undefined): PublicKey | undefined => {
  const connection = useConnection();
  const wumbo = useWumbo()
  const { result: key } = useAsync(async (connection: Connection | undefined, wumbo: Wumbo | undefined, name: string | undefined) => {
      if (connection && name && wumbo) {
        return wumbo.getTwitterClaimedTokenRefKey(connection, name)
      }
    },
    [connection, wumbo, name]
  )
  return key;
};

export const useClaimedTokenRefKey = (owner: PublicKey | undefined): PublicKey | undefined => {
  const wumbo = useWumbo()
  const { result } = useAsync(async (wumbo: Wumbo | undefined, owner: PublicKey | undefined) => wumbo?.getTokenRefKeyFromOwner(owner), [wumbo, owner]);

  return result;
};

export function useTokenRefFromBonding(tokenBonding: PublicKey | undefined): UseAccountState<TokenRef> {
  const wumbo = useWumbo()
  const { result: key } = useAsync(async (wumbo: Wumbo | undefined, tokenBonding: PublicKey | undefined) =>
    wumbo?.getTokenRefKeyFromBonding(tokenBonding),
    [wumbo, tokenBonding]
  );
  return useAccount(key, TokenRef.fromAccount)
}

export function useClaimedTokenRef(owner: PublicKey | undefined): UseAccountState<TokenRef> {
  const key = useClaimedTokenRefKey(owner);
  return useAccount(key, TokenRef.fromAccount)
}

export const useTwitterTokenRef = (name: string | undefined): UseAccountState<TokenRef> => {
  const claimedKey = useClaimedTwitterTokenRefKey(name);
  const unclaimedKey = useUnclaimedTwitterTokenRefKey(name);
  const claimed = useAccount(claimedKey, TokenRef.fromAccount);
  const unclaimed = useAccount(unclaimedKey, TokenRef.fromAccount);
  const result = useMemo(() => {
    if (claimed.info) {
      return claimed;
    }
    return unclaimed;
  }, [claimed, unclaimed])

  return result
};

export function useSocialTokenMetadata(owner: PublicKey | undefined): TokenMetadata {
  const { info: tokenRef, loading } = useClaimedTokenRef(owner)
  const { info: tokenBonding } = useAccount(tokenRef?.tokenBonding, TokenBondingV0.fromAccount)

  return useTokenMetadata(tokenBonding?.targetMint);
}
