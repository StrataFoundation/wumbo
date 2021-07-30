import { getHashedName, getNameAccountKey, NameRegistryState } from "@bonfida/spl-name-service";
import { getTld, getTwitterHandle } from "./twitter";
import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { WUMBO_INSTANCE_KEY, WUMBO_PROGRAM_ID } from "../constants/globals";
import { useConnection } from "@oyster/common";
import { useAccount, UseAccountState } from "./account";
import { TokenRef } from "spl-wumbo";
import { useAsync, useAsyncCallback } from "react-async-hook";
import { TokenBondingV0 } from "spl-token-bonding";
import { TokenMetadata, useTokenMetadata } from "./metaplex/hooks";

export async function getUnclaimedTokenRefKey(name: string): Promise<PublicKey> {
  const hashedName = await getHashedName(name);
  const twitterHandleRegistryKey = await getNameAccountKey(
    hashedName,
    undefined,
    await getTld()
  );
  const [key, _] = await PublicKey.findProgramAddress(
    [
      Buffer.from("unclaimed-ref", "utf-8"),
      WUMBO_INSTANCE_KEY.toBuffer(),
      twitterHandleRegistryKey.toBuffer(),
    ],
    WUMBO_PROGRAM_ID
  );

  return key;
}

export async function getClaimedTokenRefKeyFromOwner(owner: PublicKey | undefined): Promise<PublicKey | undefined> {
  if (!owner) {
    return undefined;
  }

  return (await PublicKey.findProgramAddress(
    [
      Buffer.from("claimed-ref", "utf-8"),
      WUMBO_INSTANCE_KEY.toBuffer(),
      owner.toBuffer(),
    ],
    WUMBO_PROGRAM_ID
  ))[0];
}

export async function getClaimedTokenRefKey(connection: Connection, name: string): Promise<PublicKey | undefined> {
  const header = await getTwitterHandle(connection, name)
  if (header) {
    return getClaimedTokenRefKeyFromOwner(header.owner)
  }
}

export async function getTokenRefKey(connection: Connection, name: string): Promise<PublicKey> {
  return await getUnclaimedTokenRefKey(name) || await getClaimedTokenRefKey(connection, name)
}

export const useTokenRefKey = (name: string | undefined): PublicKey | undefined => {
  const [key, setKey] = useState<PublicKey>();
  const connection = useConnection();
  useEffect(() => {
    (async () => {
      if (name) {
        setKey(await getTokenRefKey(connection, name));
      }
    })();
  }, [name]);

  return key;
};

export const useClaimedTokenRefKey = (owner: PublicKey | undefined): PublicKey | undefined => {
  const { result } = useAsync(getClaimedTokenRefKeyFromOwner, [owner]);

  return result;
};

export function useClaimedTokenRef(owner: PublicKey | undefined): UseAccountState<TokenRef> {
  const key = useClaimedTokenRefKey(owner);
  return useAccount(key, TokenRef.fromAccount)
}

export const useTokenRef = (name: string | undefined): UseAccountState<TokenRef> => {
  const key = useTokenRefKey(name);

  return useAccount(key, TokenRef.fromAccount);
};

export function useSocialTokenMetadata(owner: PublicKey | undefined): TokenMetadata {
  const { info: tokenRef, loading } = useClaimedTokenRef(owner)
  const { info: tokenBonding } = useAccount(tokenRef?.tokenBonding, TokenBondingV0.fromAccount)

  return useTokenMetadata(tokenBonding?.targetMint);
}