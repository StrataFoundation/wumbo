import { AR_SOL_HOLDER_ID, IS_DEV } from "../../constants/globals";
import { Creator, Data, programIds } from "@oyster/common";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createTokenBondingMetadata,
  updateMetadata,
} from "./tokenMetadataContract";
import crypto from "crypto";

type ArweaveFile = {
  filename: string;
  status: "success" | "fail";
  transactionId?: string;
  error?: string;
};
interface IArweaveResult {
  error?: string;
  messages?: Array<ArweaveFile>;
}

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

export async function uploadToArweave(
  txid: string,
  mintKey: PublicKey,
  files: File[]
): Promise<IArweaveResult> {
  // Ship it off to ARWeave!
  const data = new FormData();

  const tags = files.reduce(
    (acc: Record<string, Array<{ name: string; value: string }>>, f) => {
      acc[f.name] = [{ name: "mint", value: mintKey.toBase58() }];
      return acc;
    },
    {}
  );
  data.append("tags", JSON.stringify(tags));
  data.append("transaction", txid);
  files.map((f) => data.append("file[]", f));

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

  return result;
}

export async function createMetadataWithArweave(
  updateAuthority: PublicKey,
  payer: PublicKey,
  metadataFile: ArweaveFile,
  mintKey: PublicKey,
  tokenRef: PublicKey,
  tokenRefOwner: PublicKey,
  tokenBonding: PublicKey,
  tokenBondingAuthority: PublicKey,
  mintAuthorityKey: PublicKey,
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
  instructions: TransactionInstruction[];
}> {
  const instructions: TransactionInstruction[] = [];
  // TODO: connect to testnet arweave
  const arweaveLink = `https://arweave.net/${metadataFile.transactionId}`;
  const metadataAccount = await createTokenBondingMetadata(
    new Data({
      symbol: metadata.symbol,
      name: metadata.name,
      uri: arweaveLink, // size of url for arweave
      sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
      creators: metadata.creators,
    }),
    updateAuthority,
    mintKey,
    tokenRef,
    tokenRefOwner,
    tokenBonding,
    tokenBondingAuthority,
    mintAuthorityKey,
    instructions,
    payer
  );

  return {
    metadataAccount,
    instructions,
  };
}

export async function updateMetadataWithArweave(
  tokenRef: PublicKey,
  tokenRefOwner: PublicKey,
  updateAuthority: PublicKey,
  metadataFile: ArweaveFile,
  mintKey: PublicKey,
  metadataAccount: PublicKey,
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
): Promise<TransactionInstruction[]> {
  const instructions: TransactionInstruction[] = [];
  // TODO: connect to testnet arweave
  const arweaveLink = `https://arweave.net/${metadataFile.transactionId}`;
  await updateMetadata(
    new Data({
      symbol: metadata.symbol,
      name: metadata.name,
      uri: arweaveLink, // size of url for arweave
      sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
      creators: metadata.creators,
    }),
    tokenRef,
    tokenRefOwner,
    undefined,
    undefined,
    mintKey,
    updateAuthority,
    instructions,
    metadataAccount
  );

  return instructions;
}

export const prepPayForFilesInstructions = async (
  payer: PublicKey,
  files: File[]
): Promise<TransactionInstruction[]> => {
  const memo = programIds().memo;

  const instructions: TransactionInstruction[] = [];

  instructions.push(
    SystemProgram.transfer({
      fromPubkey: payer,
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

  return instructions;
};
