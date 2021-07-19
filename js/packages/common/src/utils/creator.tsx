import { getHashedName, getNameAccountKey } from "@bonfida/spl-name-service";
import { getTld } from "./twitter";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { WUMBO_INSTANCE_KEY, WUMBO_PROGRAM_ID } from "../constants/globals";
import { useAccount, UseAccountState } from "./account";
import { WumboCreator } from "spl-wumbo";

export async function getCreatorKey(name: string): Promise<PublicKey> {
  const hashedName = await getHashedName(name);
  const twitterHandleRegistryKey = await getNameAccountKey(
    hashedName,
    undefined,
    await getTld()
  );
  const [key, _] = await PublicKey.findProgramAddress(
    [
      Buffer.from("creator", "utf-8"),
      WUMBO_INSTANCE_KEY.toBuffer(),
      twitterHandleRegistryKey.toBuffer(),
    ],
    WUMBO_PROGRAM_ID
  );

  return key;
}

export const useCreatorKey = (name: string | undefined): PublicKey | undefined => {
  const [key, setKey] = useState<PublicKey>();

  useEffect(() => {
    (async () => {
      if (name) {
        const key = await getCreatorKey(name)
        setKey(key);
      }
    })();
  }, [name]);

  return key;
};

export const useCreator = (name: string | undefined): UseAccountState<WumboCreator> => {
  const key = useCreatorKey(name);

  return useAccount(key, WumboCreator.fromAccount);
};
