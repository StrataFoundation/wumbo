// Temporary file until we get importing of wumbo-common
// working with nextjs
import { Connection, PublicKey } from "@solana/web3.js";
import { fetchConfig } from "@/contexts";
import {
  getHashedName,
  getNameAccountKey,
  NameRegistryState,
  ReverseTwitterRegistryState,
} from "@solana/spl-name-service";
import { deserializeUnchecked } from "borsh";

let twitterTld: PublicKey, twitterVerifier: PublicKey;
export async function getTwitterTld(): Promise<PublicKey> {
  if (!twitterTld) {
    const config = await fetchConfig();
    twitterTld = new PublicKey(config.tlds.twitter);
  }

  return twitterTld;
}

export async function getTwitterVerifier(): Promise<PublicKey> {
  if (!twitterVerifier) {
    const config = await fetchConfig();
    twitterVerifier = new PublicKey(config.verifiers.twitter);
  }

  return twitterVerifier;
}

export async function getTwitterReverse(
  connection: Connection,
  owner: PublicKey
): Promise<ReverseTwitterRegistryState> {
  const hashedName = await getHashedName(owner.toString());

  const key = await getNameAccountKey(
    hashedName,
    await getTwitterVerifier(),
    await getTwitterTld()
  );

  const reverseTwitterAccount = await connection.getAccountInfo(key);
  if (!reverseTwitterAccount) {
    throw new Error("Invalid reverse Twitter account provided");
  }
  return deserializeUnchecked(
    ReverseTwitterRegistryState.schema,
    ReverseTwitterRegistryState,
    reverseTwitterAccount.data.slice(NameRegistryState.HEADER_LEN)
  );
}
