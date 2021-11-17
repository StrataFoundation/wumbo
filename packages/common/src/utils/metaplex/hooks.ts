import { useAsyncCallback } from "react-async-hook";
import { Creator, MetadataCategory } from "@oyster/common";
import { percent } from "@wum.bo/spl-utils";
import { useTokenRef, useTokenBonding } from "@strata-foundation/react";
import { useConnection } from "../../contexts/connection";
import {
  Account,
  Connection,
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { getFilesWithMetadata } from "./utils";
import { useWallet } from "../../contexts/walletContext";
import { useState } from "react";
import { prepPayForFilesInstructions, uploadToArweave } from "./arweave";
import { useTokenMetadata } from "./nftMetadataHooks";
import { usePrograms } from "../../utils/programs";
import { splWumboProgramId } from "../../constants/programs";

const RESERVED_TXN_MANIFEST = "manifest.json";

const getFileFromUrl = async (
  url: string,
  name: string,
  defaultType: string = "image/jpeg"
): Promise<[File, string]> => {
  const data = await fetch(url, { cache: "no-cache" });
  const blob = await data.blob();
  const fileName = `${name}${blob.type === defaultType ? ".jpeg" : "png"}`;
  const file = new File([blob], fileName, { type: blob.type || defaultType });

  return [file, fileName];
};

export type SetMetadataArgs = {
  name: string;
  symbol: string;
  sellBaseRoyaltyPercentage: number;
  buyBaseRoyaltyPercentage: number;
  sellTargetRoyaltyPercentage: number;
  buyTargetRoyaltyPercentage: number;
  image: File | undefined;
};

type MetadataFiniteState =
  | "idle"
  | "gathering-files"
  | "submit-solana"
  | "submit-arweave";
type SetMetadataState = {
  state: MetadataFiniteState;
  error: Error | undefined;
  setMetadata: (args: SetMetadataArgs) => Promise<{
    metadataAccount: PublicKey;
  } | void>;
};
export function useSetMetadata(
  tokenRefKey: PublicKey | undefined
): SetMetadataState {
  const connection = useConnection();
  const { info: tokenRef } = useTokenRef(tokenRefKey);
  const { info: tokenBonding } = useTokenBonding(tokenRef?.tokenBonding);
  const {
    publicKey: metadataAccountKey,
    image,
    metadata: inflated,
    error: tokenMetadataError,
  } = useTokenMetadata(tokenBonding?.targetMint);

  const { publicKey, signTransaction } = useWallet();
  const [state, setState] = useState<MetadataFiniteState>("idle");
  const { splWumboProgram } = usePrograms();

  async function getSignedTransaction(
    connection: Connection,
    instructions: TransactionInstruction[],
    extraSigners?: Account[]
  ): Promise<Transaction> {
    const transaction = new Transaction({
      feePayer: publicKey || undefined,
      recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
    });

    transaction.instructions = instructions;

    extraSigners && transaction.partialSign(...extraSigners);
    return signTransaction(transaction);
  }

  async function exec(args: SetMetadataArgs) {
    if (publicKey && tokenRefKey) {
      setState("gathering-files");
      const updateAuthority = (
        await PublicKey.findProgramAddress(
          [Buffer.from("metadata-update-authority"), tokenRefKey.toBuffer()],
          splWumboProgramId
        )
      )[0];
      let files: File[];
      let metadataChanged =
        args.image != undefined ||
        args.name != inflated?.data.name ||
        args.symbol != inflated.data.symbol;

      try {
        let arweaveLink;
        if (metadataChanged) {
          let imageName: string | undefined = undefined;
          if (args.image) {
            files = [args.image];
            imageName = args.image.name;
          } else if (args.image === null) {
            // Intentionally unset
            files = [];
          } else {
            // Undefined, keep the old one
            const [file, fileName] = await getFileFromUrl(image!, "untitled");
            imageName = fileName;
            files = [file];
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
                address: tokenRef!.owner! as PublicKey,
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
          // Prepay for the arweave upload we're about to do
          const prepayTxnInstructions = await prepPayForFilesInstructions(
            publicKey,
            realFiles
          );
          const prepayTxn = await getSignedTransaction(
            connection,
            prepayTxnInstructions
          );
          setState("submit-solana");
          const txid = await sendAndConfirmRawTransaction(
            connection,
            prepayTxn.serialize()
          );
          try {
            await connection.confirmTransaction(txid, "max");
          } catch {
            // ignore
          }

          // Do the arweave upload
          setState("submit-arweave");
          const result = await uploadToArweave(
            txid,
            tokenBonding!.targetMint,
            realFiles
          );
          const metadataFile = result.messages?.find(
            (m) => m.filename === RESERVED_TXN_MANIFEST
          );
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
          arweaveLink = `https://arweave.net/${metadataFile.transactionId}`;
        } else {
          arweaveLink = inflated?.data.uri;
        }

        setState("submit-solana");
        const changeArgs = {
          tokenRef: tokenRef!.publicKey,
          symbol: args.symbol,
          name: args.name,
          uri: arweaveLink, // size of url for arweave
          sellBaseRoyaltyPercentage: percent(args.sellBaseRoyaltyPercentage),
          buyBaseRoyaltyPercentage: percent(args.buyBaseRoyaltyPercentage),
          sellTargetRoyaltyPercentage: percent(
            args.sellTargetRoyaltyPercentage
          ),
          buyTargetRoyaltyPercentage: percent(args.buyTargetRoyaltyPercentage),
        };
        await splWumboProgram!.updateMetadata(changeArgs);

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
    error: error || tokenMetadataError,
    setMetadata: execute,
  };
}
