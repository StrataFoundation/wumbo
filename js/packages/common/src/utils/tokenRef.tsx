import { getHashedName, getNameAccountKey, NameRegistryState } from "@bonfida/spl-name-service";
import { getTld, getTwitterHandle } from "./twitter";
import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { WUMBO_INSTANCE_KEY, WUMBO_PROGRAM_ID } from "../constants/globals";
import { useConnection } from "@oyster/common";
import { useAccount, UseAccountState } from "./account";
import { TokenRef } from "spl-wumbo";

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

export async function getClaimedTokenRefKey(connection: Connection, name: string): Promise<PublicKey | undefined> {
  const header = await getTwitterHandle(connection, name)
  if (header) {
    const [key, _] = await PublicKey.findProgramAddress(
      [
        Buffer.from("claimed-ref", "utf-8"),
        WUMBO_INSTANCE_KEY.toBuffer(),
        header.owner.toBuffer(),
      ],
      WUMBO_PROGRAM_ID
    );
  
    return key;
  }
}

export async function getTokenRefKey(connection: Connection, name: string): Promise<PublicKey> {
  return await getClaimedTokenRefKey(connection, name) || await getUnclaimedTokenRefKey(name)
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

export const useTokenRef = (name: string | undefined): UseAccountState<TokenRef> => {
  const key = useTokenRefKey(name);

  return useAccount(key, TokenRef.fromAccount);
};
