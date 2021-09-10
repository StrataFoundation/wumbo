import { useAsync, useAsyncCallback } from "react-async-hook";
import {
  Creator,
  decodeMetadata,
  Metadata,
  MetadataCategory,
  METADATA_PREFIX,
  useConnection,
} from "@oyster/common";
import { useAccount } from "../account";
import {
  Account,
  Connection,
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { getDescription, getFilesWithMetadata, getImage, getMetadataKey } from "./utils";
import { useWallet } from "../../contexts/walletContext";
import { TokenRef } from "@wum.bo/spl-wumbo";
import { useMint } from "../mintState";
import { TokenBondingV0 } from "@wum.bo/spl-token-bonding";
import { useState } from "react";
import {
  createMetadataWithArweave,
  prepPayForFilesInstructions,
  updateMetadataWithArweave,
  uploadToArweave,
} from "./arweave";
import { WUMBO_PROGRAM_ID } from "../../constants/globals";
import { useTokenMetadata } from "./nftMetadataHooks";

const RESERVED_TXN_MANIFEST = "manifest.json";

async function getSignedTransaction(
  connection: Connection,
  instructions: TransactionInstruction[],
  extraSigners?: Account[]
): Promise<Transaction> {
  const { signTransaction, publicKey } = useWallet();
  const transaction = new Transaction({
    feePayer: publicKey || undefined,
    recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
  });

  transaction.instructions = instructions;

  extraSigners && transaction.partialSign(...extraSigners);
  return signTransaction(transaction);
}

async function getFileFromUrl(url: string, name: string, defaultType = "image/jpeg") {
  const response = await fetch(url);
  const data = await response.blob();
  return new File([data], name, {
    type: response.headers.get("content-type") || defaultType,
  });
}

export type SetMetadataArgs = {
  name: string;
  symbol: string;
  founderRewardsPercent: number;
  image: File | undefined;
};

type MetadataFiniteState =
  | "idle"
  | "gathering-files"
  | "awaiting-approval"
  | "submit-solana"
  | "submit-arweave";
type SetMetadataState = {
  state: MetadataFiniteState;
  error: Error | undefined;
  setMetadata: (args: SetMetadataArgs) => Promise<{
    metadataAccount: PublicKey;
  } | void>;
};
export function useSetMetadata(tokenRefKey: PublicKey | undefined): SetMetadataState {
  const connection = useConnection();
  const { info: tokenRef } = useAccount(tokenRefKey, TokenRef.fromAccount);
  const { info: tokenBonding } = useAccount(tokenRef?.tokenBonding, TokenBondingV0.fromAccount);
  const {
    publicKey: metadataAccountKey,
    image,
    metadata: inflated,
  } = useTokenMetadata(tokenBonding?.targetMint);
  const { publicKey } = useWallet();
  const [state, setState] = useState<MetadataFiniteState>("idle");
  const mint = useMint(tokenBonding?.targetMint);

  async function exec(args: SetMetadataArgs) {
    if (publicKey && tokenRefKey) {
      setState("gathering-files");
      const updateAuthority = (
        await PublicKey.findProgramAddress(
          [Buffer.from("metadata-update-authority"), tokenRefKey.toBuffer()],
          WUMBO_PROGRAM_ID
        )
      )[0];
      let files: File[];
      let imageName: string | undefined = undefined;
      if (args.image) {
        files = [args.image];
        imageName = args.image.name;
      } else if (args.image === null) {
        // Intentionally unset
        files = [];
      } else {
        // Undefined, keep the old one
        imageName = "image-file";
        files = [await getFileFromUrl(image!, imageName)];
      }
      const metadata = {
        name: args.name,
        symbol: args.symbol,
        description: "",
        image: imageName,
        external_url: "",
        animation_url: undefined,
        properties: {
          category: MetadataCategory.Image,
          files,
        },
        creators: [
          new Creator({
            address: tokenRef!.owner!,
            verified: false,
            share: 99,
          }),
          new Creator({
            address: updateAuthority,
            verified: false,
            share: 1,
          }),
        ],
        sellerFeeBasisPoints: 0,
      };
      console.log(`Metadata: ${JSON.stringify(metadata, null, 2)}`);
      const realFiles = getFilesWithMetadata(files, metadata);
      try {
        // Prepay for the arweave upload we're about to do
        const prepayTxnInstructions = await prepPayForFilesInstructions(publicKey, realFiles);
        setState("awaiting-approval");
        const prepayTxn = await getSignedTransaction(connection, prepayTxnInstructions);
        setState("submit-solana");
        const txid = await sendAndConfirmRawTransaction(connection, prepayTxn.serialize());
        try {
          await connection.confirmTransaction(txid, "max");
        } catch {
          // ignore
        }

        // Do the arweave upload
        setState("submit-arweave");
        const result = await uploadToArweave(txid, tokenBonding!.targetMint, realFiles);
        const metadataFile = result.messages?.find((m) => m.filename === RESERVED_TXN_MANIFEST);
        console.log(JSON.stringify(metadataFile, null, 2));

        // For testing
        // const metadataFile: ArweaveFile = {
        //   "filename": "manifest.json",
        //   "status": "success",
        //   "transactionId": "boKFtPRFFgqmBykP0Z6mOkgoQyO9Tk8QXYxOn6sQRXA"
        // };
        if (!metadataFile) {
          throw new Error("Metdata file not found");
        }

        // Use the uploaded arweave files in token metadata
        setState("submit-solana");
        let metadataInstructions;
        const metadataAccount =
          metadataAccountKey && (await connection.getAccountInfo(metadataAccountKey));
        if (metadataAccount && metadataAccountKey) {
          metadataInstructions = await updateMetadataWithArweave(
            tokenRef!.publicKey,
            tokenRef!.owner!,
            updateAuthority,
            metadataFile,
            tokenBonding!.targetMint,
            metadataAccountKey,
            metadata
          );
        } else {
          metadataInstructions = (
            await createMetadataWithArweave(
              updateAuthority,
              publicKey,
              metadataFile,
              tokenBonding!.targetMint,
              tokenRef!.publicKey,
              tokenRef!.owner!,
              tokenBonding!.publicKey,
              tokenBonding!.authority!,
              mint!.mintAuthority!,
              metadata
            )
          ).instructions;
        }

        setState("awaiting-approval");
        const createMetadataTxn = await getSignedTransaction(connection, metadataInstructions);
        setState("submit-solana");
        await sendAndConfirmRawTransaction(connection, createMetadataTxn.serialize());

        return {
          metadataAccount: metadataAccountKey!,
        };
      } finally {
        setState("idle");
      }
    }
  }

  const { execute, error } = useAsyncCallback(exec);

  return {
    state,
    error,
    setMetadata: execute,
  };
}
