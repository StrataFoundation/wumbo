import { useEffect, useMemo, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useConnection } from "../contexts/connection";
import { useAccount, UseAccountState } from "./account";
import { ITokenRef, TokenRef } from "../utils/deserializers/spl-wumbo";
import { useAsync, useAsyncCallback } from "react-async-hook";
import { TokenBondingV0 } from "@wum.bo/spl-token-bonding";
import { IUseTokenMetadataResult, useTokenMetadata } from "./metaplex";
import { splWumboProgramId } from "../constants/programs";
import { getTwitterRegistry, getTwitterRegistryKey } from "../utils";
import { usePrograms } from "./programs";
import { ITokenBonding, TokenBonding } from "./deserializers/spl-token-bonding";
import { WUMBO_INSTANCE_KEY } from "../constants/globals";
import { getTld } from "./twitter";

export async function getTokenRefKeyFromOwner( owner: PublicKey): Promise<PublicKey> {
  return (await PublicKey.findProgramAddress(
    [Buffer.from("token-ref", "utf-8"), WUMBO_INSTANCE_KEY.toBuffer(), owner.toBuffer()],
    splWumboProgramId
  ))[0];
}
export async function getTwitterClaimedTokenRefKey(connection: Connection, handle: string): Promise<PublicKey> {
  const owner = (await getTwitterRegistry(connection, handle, await getTld())).owner;

  return (await PublicKey.findProgramAddress(
    [Buffer.from("token-ref", "utf-8"), WUMBO_INSTANCE_KEY.toBuffer(), owner.toBuffer()],
    splWumboProgramId
  ))[0];
}
export async function getTwitterUnclaimedTokenRefKey(handle: string): Promise<PublicKey> {
  const name = await getTwitterRegistryKey(handle, await getTld());

  return (await PublicKey.findProgramAddress(
    [Buffer.from("token-ref", "utf-8"), WUMBO_INSTANCE_KEY.toBuffer(), name.toBuffer()],
    splWumboProgramId
  ))[0];
}
export async function getReverseTokenRefKey(targetMint: PublicKey): Promise<PublicKey> {
  return (await PublicKey.findProgramAddress(
    [Buffer.from("reverse-token-ref", "utf-8"), WUMBO_INSTANCE_KEY.toBuffer(), targetMint.toBuffer()],
    splWumboProgramId
  ))[0];
}

export const useUnclaimedTwitterTokenRefKey = (name: string | undefined): PublicKey | undefined => {
  const connection = useConnection();
  const { result: key } = useAsync(async (name: string | undefined) => {
      if (connection && name) {
        return getTwitterUnclaimedTokenRefKey(name)
      }
    },
    [name]
  )
  return key;
};


export const useClaimedTwitterTokenRefKey = (name: string | undefined): PublicKey | undefined => {
  const connection = useConnection();
  const { result: key } = useAsync(async (connection: Connection | undefined, name: string | undefined) => {
      if (connection && name) {
        return getTwitterClaimedTokenRefKey(connection, name)
      }
    },
    [connection, name]
  )
  return key;
};

export const useClaimedTokenRefKey = (owner: PublicKey | undefined): PublicKey | undefined => {
  const { result } = useAsync(async (owner: PublicKey | undefined) => owner && getTokenRefKeyFromOwner(owner), [owner]);

  return result;
};

export function useTokenRefFromBonding(tokenBonding: PublicKey | undefined): UseAccountState<ITokenRef> {
  const bonding = useAccount(tokenBonding, TokenBonding);
  const { result: key } = useAsync(async (bonding: TokenBondingV0 | undefined) =>
    bonding && getReverseTokenRefKey(bonding.targetMint),
    [bonding.info]
  );
  return useAccount(key, TokenRef, true)
}

export function useClaimedTokenRef(owner: PublicKey | undefined): UseAccountState<ITokenRef> {
  const key = useClaimedTokenRefKey(owner);
  return useAccount(key, TokenRef, true)
}

export const useTwitterTokenRef = (name: string | undefined): UseAccountState<ITokenRef> => {
  const claimedKey = useClaimedTwitterTokenRefKey(name);
  const unclaimedKey = useUnclaimedTwitterTokenRefKey(name);
  const claimed = useAccount(claimedKey, TokenRef, true);
  const unclaimed = useAccount(unclaimedKey, TokenRef, true);
  const result = useMemo(() => {
    if (claimed.info) {
      return claimed;
    }
    return unclaimed;
  }, [claimed, unclaimed])

  return result
};

export interface IUseSocialTokenMetadataResult extends IUseTokenMetadataResult {
  tokenBonding?: ITokenBonding;
  tokenRef?: ITokenRef
}

export function useSocialTokenMetadata(owner: PublicKey | undefined): IUseSocialTokenMetadataResult {
  const { info: tokenRef, loading } = useClaimedTokenRef(owner)
  const { info: tokenBonding } = useAccount(tokenRef?.tokenBonding, TokenBonding)

  return {
    ...useTokenMetadata(tokenBonding?.targetMint),
    tokenRef,
    tokenBonding
  }
}
