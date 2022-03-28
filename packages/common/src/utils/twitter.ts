import {
  getHashedName,
  getNameAccountKey,
  NameRegistryState,
  NAME_PROGRAM_ID,
  ReverseTwitterRegistryState
} from "@bonfida/spl-name-service";
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import {
  getOwnerForName,
  useAccount,
  useAccountFetchCache,
  UseAccountState
} from "@strata-foundation/react";
import { deserializeUnchecked } from "borsh";
import { useAsync } from "react-async-hook";
import { fetchConfig } from "../contexts";
import { useTwitterTld, useTwitterVerifier } from "../hooks";
import {
  createVerifiedTwitterRegistry,
  getTwitterRegistry
} from "./testableNameServiceTwitter";

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

const ReverseTwitterParser = (pubkey: PublicKey, account: AccountInfo<Buffer>) => {
  return deserializeUnchecked(
    ReverseTwitterRegistryState.schema,
    ReverseTwitterRegistryState,
    account.data.slice(NameRegistryState.HEADER_LEN)
  )
}

function useReverseTwitterAccount(
  key: PublicKey | undefined
): UseAccountState<ReverseTwitterRegistryState> {
  return useAccount(key, ReverseTwitterParser);
}

interface ReverseTwitterState {
  loading: boolean;
  handle: string | undefined;
  error: Error | undefined;
}
export function useReverseTwitter(
  owner: PublicKey | undefined
): ReverseTwitterState {
  const tld = useTwitterTld()
  const verifier = useTwitterVerifier();
  const {
    loading: loading1,
    error: error1,
    result: hashedName,
  } = useAsync(
    async (owner: string | undefined) => owner ? getHashedName(owner) : undefined,
    [owner?.toBase58()]
  );
  const {
    loading: loading2,
    error: error2,
    result: key,
  } = useAsync(
    async (
      hashedName: Buffer | undefined,
      tld: PublicKey | undefined,
      verifier: PublicKey | undefined
    ) => {
      if (hashedName && verifier && tld) {
        return getNameAccountKey(hashedName, verifier, tld);
      }
    },
    [hashedName, tld, verifier]
  );

  const { info, loading: loading3 } = useReverseTwitterAccount(key)
  return {
    loading: loading1 && loading2 && loading3,
    error: error1 || error2,
    handle: info?.twitterHandle,
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
