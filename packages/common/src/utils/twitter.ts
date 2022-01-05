import {
  getHashedName,
  getNameAccountKey,
  NameRegistryState,
  NAME_PROGRAM_ID,
  ReverseTwitterRegistryState,
} from "@bonfida/spl-name-service";
import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";
import { deserializeUnchecked } from "borsh";
import { useAsync } from "react-async-hook";
import { WUMBO_IDENTITY_SERVICE_URL } from "../constants/globals";
import {
  createVerifiedTwitterRegistry,
  getTwitterRegistry,
} from "./testableNameServiceTwitter";
import {
  useAccountFetchCache,
  getOwnerForName,
} from "@strata-foundation/react";
import { useTwitterTld } from "../hooks";

let twitterTld: PublicKey, twitterVerifier: PublicKey;
async function fetchConfig(): Promise<void> {
  try {
    const config = await (
      await axios.get(WUMBO_IDENTITY_SERVICE_URL + "/config")
    ).data;
    twitterTld = new PublicKey(config.tlds.twitter);
    twitterVerifier = new PublicKey(config.verifiers.twitter);
  } catch (e: any) {
    console.error(e);
    twitterTld = new PublicKey("Fhqd3ostRQQE65hzoA7xFMgT9kge2qPnsTNAKuL2yrnx");
    twitterVerifier = new PublicKey(
      "DTok7pfUzNeNPqU3Q6foySCezPQE82eRyhX1HdhVNLVC"
    );
  }
}

export async function getTwitterTld(): Promise<PublicKey> {
  if (!twitterTld) {
    await fetchConfig();
  }

  return twitterTld;
}

export async function getTwitterVerifier(): Promise<PublicKey> {
  if (!twitterVerifier) {
    await fetchConfig();
  }

  return twitterVerifier;
}

export const getTwitterHandle = async (
  connection: Connection,
  twitterHandle: string
): Promise<NameRegistryState | null> => {
  try {
    return await getTwitterRegistry(
      connection,
      twitterHandle,
      await getTwitterTld()
    );
  } catch (e) {
    console.error(e);
    return null;
  }
};

export async function apiPost(url: string, body: any, headers: any) {
  try {
    let response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: headers,
    });
    console.log(response);
    if (!response.ok) {
      if (response.status == 400) {
        throw new Error(
          "Specified handle did not match the handle you logged in with, or the authorization expired. Please try again"
        );
      } else if (response.status == 500) {
        throw new Error(
          "Registration transaction failed, please report this error in our discord"
        );
      }

      throw new Error(
        `Error apiPost - status ${response.status}. Please report this error in our discord`
      );
    }
    let json = await response.json();
    return json;
  } catch (err) {
    console.warn(err);
    throw new Error(
      `Error apiPost - err ${err}. Please report this error in our discord`
    );
  }
}

export interface ClaimArgs {
  owner: PublicKey;
  twitterHandle: string;
}
export const TWITTER_REGISTRY_SIZE = 1_000;
export async function claimTwitterTransactionInstructions(
  connection: Connection,
  { owner, twitterHandle }: ClaimArgs
) {
  const nameRegistryItem = await getTwitterHandle(connection, twitterHandle);

  if (nameRegistryItem) {
    if (nameRegistryItem.owner.toBase58() != owner.toBase58()) {
      throw new Error(
        `Twitter handle is already registered to wallet ${nameRegistryItem.owner}`
      );
    }

    // Exit. It's already been claimed
    console.log("Twitter handle is already claimed by this wallet.");
    return;
  }

  const balance = await connection.getBalance(owner);

  if (balance === 0) {
    throw new Error("Insufficient Balance");
  }

  return createVerifiedTwitterRegistry(
    connection,
    twitterHandle,
    owner,
    1_000,
    owner,
    NAME_PROGRAM_ID,
    await getTwitterVerifier(),
    await getTwitterTld()
  );
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

async function getTwitterName(
  connection: Connection,
  owner: PublicKey | undefined
) {
  if (!owner) {
    return;
  }

  return (await getTwitterReverse(connection, owner)).twitterHandle;
}

interface ReverseTwitterState {
  loading: boolean;
  handle: string | undefined;
  error: Error | undefined;
}
export function useReverseTwitter(
  owner: PublicKey | undefined
): ReverseTwitterState {
  const { connection } = useConnection();
  const {
    loading,
    error,
    result: handle,
  } = useAsync(getTwitterName, [connection, owner]);

  return {
    loading,
    error: error?.message?.includes("Invalid reverse Twitter account provided")
      ? undefined
      : error,
    handle,
  };
}

interface TwitterState {
  loading: boolean;
  owner: PublicKey | undefined;
  error: Error | undefined;
}
export function useTwitterOwner(handle: string | undefined): TwitterState {
  const cache = useAccountFetchCache();
  const tld = useTwitterTld();
  const {
    loading,
    error,
    result: owner,
  } = useAsync(getOwnerForName, [cache, handle, tld]);

  return {
    loading,
    error,
    owner,
  };
}
