
import { getTwitterRegistry } from "@bonfida/spl-name-service";
import { WalletAdapter } from "@solana/wallet-base";
import { Connection, Transaction } from "@solana/web3.js";
import { createVerifiedTwitterRegistry } from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@/../../oyster-common/dist/lib";

export const TWITTER_REGISTRAR_SERVER_URL =
  process.env.REACT_APP_TWITTER_REGISTRAR_SERVER || "http://localhost:3000/registrar/twitter-oauth";

export const twitterHandleExists = async (
  connection: Connection,
  twitterHandle: string
) => {
  try {
    await getTwitterRegistry(connection, twitterHandle);
    return true;
  } catch {
    return false;
  }
};

export async function apiPost(url: string, body: any, headers: any) {
  try {
    let response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: headers,
    });
    if (!response.ok) {
      throw new Error(`Error apiPost - status ${response.status}`);
    }
    let json = await response.json();
    return json;
  } catch (err) {
    console.warn(err);
    throw new Error(`Error apiPost - err ${err}`);
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
  const alreadyExists = await twitterHandleExists(connection, twitterHandle);
  if (alreadyExists) {
    throw new Error("Twitter handle is already registered");
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
