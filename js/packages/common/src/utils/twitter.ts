
import { getTwitterRegistry, NameRegistryState } from "@bonfida/spl-name-service";
import { WalletAdapter } from "@solana/wallet-base";
import { Connection, Transaction } from "@solana/web3.js";
import { createVerifiedTwitterRegistry } from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@/../../oyster-common/dist/lib";

export const TWITTER_REGISTRAR_SERVER_URL =
  process.env.REACT_APP_TWITTER_REGISTRAR_SERVER || "https://google.com";

export const getTwitterHandle = async (
  connection: Connection,
  twitterHandle: string
): Promise<NameRegistryState | null> => {
  try {
    return getTwitterRegistry(connection, twitterHandle);
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
  transaction: Transaction,
  userPubkey: PublicKey,
  code: string,
  redirectUri: string,
  twitterHandle: string
) => {
  const transactionBuffer = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });

  const payload = {
    transaction: JSON.stringify(transactionBuffer),
    pubkey: userPubkey.toBase58(),
    code,
    redirectUri,
    twitterHandle: twitterHandle,
  };
  const result = await apiPost(TWITTER_REGISTRAR_SERVER_URL, payload, {
    "Content-type": "application/json",
  });
  return result;
};

export interface ClaimArgs {
  wallet: WalletAdapter,
  twitterHandle: string
}
export async function claimTwitterTransaction(connection: Connection, { wallet, twitterHandle }: ClaimArgs) {
  const nameRegistryItem = await getTwitterHandle(connection, twitterHandle);
  if (nameRegistryItem) {
    if (nameRegistryItem.owner != wallet.publicKey) {
      throw new Error(`Twitter handle is already registered to wallet ${nameRegistryItem.owner}`);
    }

    // Exit. It's already been claimed
    return
  }

  if (!wallet.publicKey) {
    throw new Error("Wallet not connected");
  }

  const balance = await connection.getBalance(wallet.publicKey);

  if (balance === 0) {
    throw new Error("Insufficient Balance");
  }

  const instruction = await createVerifiedTwitterRegistry(
    connection,
    twitterHandle,
    wallet.publicKey,
    1_000,
    wallet.publicKey
  );
  const transaction = new Transaction().add(...instruction);
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash("max")
  ).blockhash;

  transaction.feePayer = wallet.publicKey;

  await wallet.signTransaction(transaction);

  return transaction;
}
