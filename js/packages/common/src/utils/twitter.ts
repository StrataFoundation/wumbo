
import { useConnection } from "@oyster/common";
import { createNameRegistry, getHashedName, getNameAccountKey, TWITTER_ROOT_PARENT_REGISTRY_KEY, NameRegistryState, TWITTER_VERIFICATION_AUTHORITY, NAME_PROGRAM_ID, ReverseTwitterRegistryState } from "@bonfida/spl-name-service";
import { WalletAdapter } from "@solana/wallet-base";
import { Account, Connection, sendAndConfirmRawTransaction, Transaction, TransactionInstruction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";
import { useAsync, useAsyncCallback } from "react-async-hook";
import { TWITTER_REGISTRAR_SERVER_URL } from "../constants/globals";
import { createVerifiedTwitterRegistry, getTwitterRegistry } from "./testableNameServiceTwitter";

const DEV_MODE = true;
const DEV_TLD = "NoahTest2";

async function sendTransaction(
  connection: Connection,
  instructions: TransactionInstruction[],
  wallet: WalletAdapter,
  extraSigners?: Account[]
): Promise<void> {
  const transaction = new Transaction({
    feePayer: wallet.publicKey || undefined,
    recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
  });
  transaction.instructions = instructions;

  extraSigners && transaction.partialSign(...extraSigners);
  const signed = await wallet.signTransaction(transaction);

  await sendAndConfirmRawTransaction(connection, signed.serialize());
}

export async function createTestTld(connection: Connection, wallet: WalletAdapter) {
  if (DEV_MODE) {
    const tld = await getNameAccountKey(await getHashedName(DEV_TLD));
    const account = await connection.getAccountInfo(tld);
    if (!account) {
      console.log("Testing tld doesn't exist, creating...")
      const createInstruction = await createNameRegistry(connection, DEV_TLD, 1000, wallet.publicKey!, wallet.publicKey!);
      console.log(await sendTransaction(connection, [createInstruction], wallet));
    }
  }
}

export async function getTld(): Promise<PublicKey> {
  return DEV_MODE ? await getNameAccountKey(await getHashedName(DEV_TLD)) : TWITTER_ROOT_PARENT_REGISTRY_KEY
}

export const getTwitterHandle = async (
  connection: Connection,
  twitterHandle: string
): Promise<NameRegistryState | null> => {
  try {
    return await getTwitterRegistry(connection, twitterHandle, await getTld());
  } catch {
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
        throw new Error("Specified handle did not match the handle you logged in with, or the authorization expired. Please try again")
      } else if (response.status == 500) {
        throw new Error("Registration transaction failed, please report this error in our discord")
      }

      throw new Error(`Error apiPost - status ${response.status}. Please report this error in our discord`);
    }
    let json = await response.json();
    return json;
  } catch (err) {
    console.warn(err);
    throw new Error(`Error apiPost - err ${err}. Please report this error in our discord`);
  }
}

export const postTwitterRegistrarRequest = async (
  connection: Connection,
  instructions: TransactionInstruction[],
  wallet: WalletAdapter,
  code: string,
  redirectUri: string,
  twitterHandle: string
) => {
  if (DEV_MODE) {
    console.log("Sending dev mode claim twitter handle txn...")
    await sendTransaction(connection, instructions, wallet);
  } else {
    const transaction = new Transaction({
      feePayer: wallet.publicKey || undefined,
      recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
    });
    transaction.instructions = instructions;
    const signed = await wallet.signTransaction(transaction);

    const transactionBuffer = signed.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    const payload = {
      transaction: JSON.stringify(transactionBuffer),
      pubkey: wallet.publicKey!.toBase58(),
      code,
      redirectUri,
      twitterHandle: twitterHandle,
    };
    const result = await apiPost(TWITTER_REGISTRAR_SERVER_URL, payload, {
      "Content-type": "application/json",
    });
    return result;
  }
};

export interface ClaimArgs {
  owner: PublicKey,
  twitterHandle: string
}
export const TWITTER_REGISTRY_SIZE = 1_000;
export async function claimTwitterTransactionInstructions(connection: Connection, { owner, twitterHandle }: ClaimArgs) {
  const nameRegistryItem = await getTwitterHandle(connection, twitterHandle);
  if (nameRegistryItem) {
    if (nameRegistryItem.owner.toBase58() != owner.toBase58()) {
      throw new Error(`Twitter handle is already registered to wallet ${nameRegistryItem.owner}`);
    }

    // Exit. It's already been claimed
    console.log("Twitter handle is already claimed by this wallet.")
    return
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
    DEV_MODE ? owner : TWITTER_VERIFICATION_AUTHORITY,
    await getTld()
  );
}

export async function getTwitterReverse(connection: Connection, owner: PublicKey): Promise<ReverseTwitterRegistryState> {
  const hashedName = await getHashedName(owner.toString());
  const key = await getNameAccountKey(
    hashedName,
    DEV_MODE ? owner : TWITTER_VERIFICATION_AUTHORITY,
    await getTld()
  );

  return ReverseTwitterRegistryState.retrieve(connection, key)
}

async function getTwitterName(connection: Connection, owner: PublicKey) {
  return (await getTwitterReverse(connection, owner)).twitterHandle
}

interface ReverseTwitterState {
  loading: boolean;
  handle: string | undefined;
  error: Error | undefined;
}
export function useReverseTwitter(owner: PublicKey): ReverseTwitterState {
  const connection = useConnection();
  const { loading, error, result: handle } = useAsync(getTwitterName, [connection, owner]);

  return {
    loading,
    error,
    handle
  }
}