import {
  createAssociatedTokenAccountInstruction,
  createMint,
  createMetadata,
  programIds,
  notify,
  ENV,
  updateMetadata,
  createMasterEdition,
  sendTransactionWithRetry,
  Data,
  Creator,
  findProgramAddress,
} from "@oyster/common";
import React from "react";
import { MintLayout, Token } from "@solana/spl-token";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import {
  Keypair,
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import crypto from "crypto";
import { AR_SOL_HOLDER_ID, IS_DEV } from "../constants/globals";
import BN from "bn.js";
const RESERVED_TXN_MANIFEST = "manifest.json";

export const LAMPORT_MULTIPLIER = 10 ** 9;
const WINSTON_MULTIPLIER = 10 ** 12;

async function getAssetCostToStore(files: File[]) {
  const totalBytes = files.reduce((sum, f) => (sum += f.size), 0);
  console.log("Total bytes", totalBytes);
  const txnFeeInWinstons = parseInt(
    await (await fetch("https://arweave.net/price/0")).text()
  );
  console.log("txn fee", txnFeeInWinstons);
  const byteCostInWinstons = parseInt(
    await (
      await fetch("https://arweave.net/price/" + totalBytes.toString())
    ).text()
  );
  console.log("byte cost", byteCostInWinstons);
  const totalArCost =
    (txnFeeInWinstons * files.length + byteCostInWinstons) / WINSTON_MULTIPLIER;

  console.log("total ar", totalArCost);

  let conversionRates = JSON.parse(
    localStorage.getItem("conversionRates") || "{}"
  );

  if (
    !conversionRates ||
    !conversionRates.expiry ||
    conversionRates.expiry < Date.now()
  ) {
    console.log("Calling conversion rate");
    conversionRates = {
      value: JSON.parse(
        await (
          await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=solana,arweave&vs_currencies=usd"
          )
        ).text()
      ),
      expiry: Date.now() + 5 * 60 * 1000,
    };

    if (conversionRates.value.solana)
      localStorage.setItem("conversionRates", JSON.stringify(conversionRates));
  }

  // To figure out how many lamports are required, multiply ar byte cost by this number
  const arMultiplier =
    conversionRates.value.arweave.usd / conversionRates.value.solana.usd;
  console.log("Ar mult", arMultiplier);
  // We also always make a manifest file, which, though tiny, needs payment.
  return LAMPORT_MULTIPLIER * totalArCost * arMultiplier * 1.1;
}

interface IArweaveResult {
  error?: string;
  messages?: Array<{
    filename: string;
    status: "success" | "fail";
    transactionId?: string;
    error?: string;
  }>;
}

// Adapted from mintNFT in metaplex.
export const setTokenMetadata = async (
  connection: Connection,
  wallet: WalletAdapter | undefined,
  files: File[],
  mintKey: PublicKey,
  metadata: {
    name: string;
    symbol: string;
    description: string;
    image: string | undefined;
    animation_url: string | undefined;
    external_url: string;
    properties: any;
    creators: Creator[] | null;
    sellerFeeBasisPoints: number;
  }
): Promise<{
  metadataAccount: PublicKey;
} | void> => {
  if (!wallet?.publicKey) {
    return;
  }

  const metadataContent = {
    name: metadata.name,
    symbol: metadata.symbol,
    description: metadata.description,
    seller_fee_basis_points: metadata.sellerFeeBasisPoints,
    image: metadata.image,
    animation_url: metadata.animation_url,
    external_url: metadata.external_url,
    properties: {
      ...metadata.properties,
      creators: metadata.creators?.map((creator) => {
        return {
          address: creator.address.toBase58(),
          share: creator.share,
        };
      }),
    },
  };

  const realFiles: File[] = [
    ...files,
    new File([JSON.stringify(metadataContent)], "metadata.json"),
  ];

  const { instructions: pushInstructions, signers: pushSigners } =
    await prepPayForFilesTxn(wallet, realFiles, metadata);

  // This owner is a temporary signer and owner of metadata we use to circumvent requesting signing
  // twice post Arweave. We store in an account (payer) and use it post-Arweave to update MD with new link
  // then give control back to the user.
  // const payer = new Account();
  const payerPublicKey = wallet.publicKey;
  const { txid } = await sendTransactionWithRetry(
    connection,
    wallet,
    pushInstructions,
    pushSigners
  );

  try {
    await connection.confirmTransaction(txid, "max");
  } catch {
    // ignore
  }

  // Ship it off to ARWeave!
  const data = new FormData();

  const tags = realFiles.reduce(
    (acc: Record<string, Array<{ name: string; value: string }>>, f) => {
      acc[f.name] = [{ name: "mint", value: mintKey.toBase58() }];
      return acc;
    },
    {}
  );
  data.append("tags", JSON.stringify(tags));
  data.append("transaction", txid);
  realFiles.map((f) => data.append("file[]", f));

  // TODO: convert to absolute file name for image

  const result: IArweaveResult = await (
    await fetch(
      // TODO: add CNAME
      IS_DEV
        ? "https://us-central1-principal-lane-200702.cloudfunctions.net/uploadFile2"
        : "https://us-central1-principal-lane-200702.cloudfunctions.net/uploadFileProd2",
      {
        method: "POST",
        body: data,
      }
    )
  ).json();

  const metadataFile = result.messages?.find(
    (m) => m.filename === RESERVED_TXN_MANIFEST
  );
  if (metadataFile?.transactionId && wallet.publicKey) {
    console.log("Found transaction and file, creating metadata");

    const instructions: TransactionInstruction[] = [];
    // TODO: connect to testnet arweave
    const arweaveLink = `https://arweave.net/${metadataFile.transactionId}`;
    const metadataAccount = await createMetadata(
      new Data({
        symbol: metadata.symbol,
        name: metadata.name,
        uri: arweaveLink, // size of url for arweave
        sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
        creators: metadata.creators,
      }),
      payerPublicKey,
      mintKey,
      payerPublicKey,
      instructions,
      wallet.publicKey
    );

    // TODO: enable when using payer account to avoid 2nd popup
    /*  if (maxSupply !== undefined)
      updateInstructions.push(
        setAuthority({
          target: authTokenAccount,
          currentAuthority: payerPublicKey,
          newAuthority: wallet.publicKey,
          authorityType: 'AccountOwner',
        }),
      );
*/
    // TODO: enable when using payer account to avoid 2nd popup
    // Note with refactoring this needs to switch to the updateMetadataAccount command
    // await transferUpdateAuthority(
    //   metadataAccount,
    //   payerPublicKey,
    //   wallet.publicKey,
    //   updateInstructions,
    // );

    const txid = await sendTransactionWithRetry(
      connection,
      wallet,
      instructions,
      []
    );

    console.log("Arweave link", arweaveLink);

    // TODO: refund funds

    // send transfer back to user
    return { metadataAccount };
  }
  // TODO:
  // 1. Jordan: --- upload file and metadata to storage API
  // 2. pay for storage by hashing files and attaching memo for each file
};

export const prepPayForFilesTxn = async (
  wallet: WalletAdapter,
  files: File[],
  metadata: any
): Promise<{
  instructions: TransactionInstruction[];
  signers: Keypair[];
}> => {
  const memo = programIds().memo;

  const instructions: TransactionInstruction[] = [];
  const signers: Keypair[] = [];

  if (wallet.publicKey)
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: AR_SOL_HOLDER_ID,
        lamports: await getAssetCostToStore(files),
      })
    );

  for (let i = 0; i < files.length; i++) {
    const hashSum = crypto.createHash("sha256");
    hashSum.update(await files[i].text());
    const hex = hashSum.digest("hex");
    instructions.push(
      new TransactionInstruction({
        keys: [],
        programId: memo,
        data: Buffer.from(hex),
      })
    );
  }

  return {
    instructions,
    signers,
  };
};
