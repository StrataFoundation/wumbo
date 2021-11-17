import { useConnection } from "../contexts/connection";
import {
  createNameRegistry,
  getHashedName,
  getNameAccountKey,
  NameRegistryState,
  NAME_PROGRAM_ID,
  ReverseTwitterRegistryState,
} from "@bonfida/spl-name-service";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import {
  Account,
  Connection,
  Keypair,
  sendAndConfirmRawTransaction,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";
import { useAsync, useAsyncCallback } from "react-async-hook";
import {
  TWITTER_REGISTRAR_SERVER_URL,
  IS_DEV,
  DEV_TWITTER_TLD,
  DEV_TWITTER_VERIFIER,
  TWITTER_VERIFIER,
  TWITTER_TLD,
} from "../constants/globals";
import {
  createVerifiedTwitterRegistry,
  getTwitterRegistry,
} from "./testableNameServiceTwitter";

async function sendTransaction(
  connection: Connection,
  instructions: TransactionInstruction[],
  wallet: WalletAdapter,
  extraSigners?: Account[]
): Promise<string> {
  const transaction = new Transaction({
    feePayer: wallet.publicKey || undefined,
    recentBlockhash: (await connection.getRecentBlockhash("confirmed"))
      .blockhash,
  });
  transaction.instructions = instructions;

  extraSigners && transaction.partialSign(...extraSigners);
  const signed = await wallet.signTransaction(transaction);

  return sendAndConfirmRawTransaction(connection, signed.serialize(), {
    commitment: "confirmed",
  });
}

export async function createTestTld(
  connection: Connection,
  wallet: WalletAdapter
) {
  if (IS_DEV) {
    const tld = await getNameAccountKey(await getHashedName(DEV_TWITTER_TLD));
    const account = await connection.getAccountInfo(tld);
    if (!account) {
      console.log("Testing tld doesn't exist, creating...");
      const createInstruction = await createNameRegistry(
        connection,
        DEV_TWITTER_TLD,
        256,
        wallet.publicKey!,
        getTwitterVerifier()
      );
      console.log(
        await sendTransaction(connection, [createInstruction], wallet)
      );
    }
  }
}

export async function getTld(): Promise<PublicKey> {
  return IS_DEV
    ? await getNameAccountKey(await getHashedName(DEV_TWITTER_TLD))
    : TWITTER_TLD;
}

export function getTwitterVerifier(): PublicKey {
  return IS_DEV ? DEV_TWITTER_VERIFIER.publicKey : TWITTER_VERIFIER;
}

export const getTwitterHandle = async (
  connection: Connection,
  twitterHandle: string
): Promise<NameRegistryState | null> => {
  try {
    return await getTwitterRegistry(connection, twitterHandle, await getTld());
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
    IS_DEV ? DEV_TWITTER_VERIFIER.publicKey : TWITTER_VERIFIER,
    await getTld()
  );
}

export async function getTwitterReverse(
  connection: Connection,
  owner: PublicKey
): Promise<ReverseTwitterRegistryState> {
  const hashedName = await getHashedName(owner.toString());
  const key = await getNameAccountKey(
    hashedName,
    IS_DEV ? DEV_TWITTER_VERIFIER.publicKey : TWITTER_VERIFIER,
    await getTld()
  );

  return ReverseTwitterRegistryState.retrieve(connection, key);
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
  const connection = useConnection();
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