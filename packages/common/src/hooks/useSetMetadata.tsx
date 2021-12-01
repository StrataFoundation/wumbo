import { useState } from "react";
import { useAsyncCallback } from "react-async-hook";
import { useConnection } from "@oyster/common";
import {
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
} from "@solana/web3.js";
import {
  useStrataSdks,
  useTokenMetadata,
  useTokenRef,
  useTokenBonding,
} from "@strata-foundation/react";
import { Data, ARWEAVE_UPLOAD_URL } from "@strata-foundation/spl-utils";
import { useWallet } from "../contexts/walletContext";

export interface ISetMetadataArgs {
  name: string;
  symbol: string;
  image: File | undefined;
  sellBaseRoyaltyPercentage: number;
  buyBaseRoyaltyPercentage: number;
  sellTargetRoyaltyPercentage: number;
  buyTargetRoyaltyPercentage: number;
}

type MetadataFiniteState =
  | "idle"
  | "gathering-files"
  | "submit-solana"
  | "submit-arweave";

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

export const useSetMetadata = (
  tokenRefKey: PublicKey | undefined
): [
  (args: ISetMetadataArgs) => Promise<{ metadataAccount: PublicKey } | void>,
  {
    data: PublicKey | undefined;
    loading: boolean;
    loadingState: MetadataFiniteState;
    error: Error | undefined;
  }
] => {
  const connection = useConnection();
  const { publicKey: walletKey, signTransaction } = useWallet();
  const { tokenCollectiveSdk, tokenMetadataSdk } = useStrataSdks();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<MetadataFiniteState>("idle");
  const [data, setData] = useState<PublicKey | undefined>();

  const { info: tokenRef } = useTokenRef(tokenRefKey);
  const { info: tokenBonding } = useTokenBonding(tokenRef?.tokenBonding);
  const {
    publicKey: metadataAccountKey,
    image,
    metadata,
    error: tokenMetadataError,
  } = useTokenMetadata(tokenBonding?.targetMint);

  const exec = async (args: ISetMetadataArgs) => {
    if (walletKey && tokenRefKey) {
      setLoading(true);
      setLoadingState("gathering-files");
      let files: Map<string, Buffer> = new Map();
      let metadataChanged =
        args.image != undefined ||
        args.name != metadata?.data.name ||
        args.symbol != metadata?.data.symbol;

      // No catch of errors as the useAsyncCallback and return handles it
      try {
        let arweaveLink;
        if (metadataChanged) {
          let imageName: string | undefined = undefined;
          if (args.image) {
            files.set(args.image.name, Buffer.from(args.image as any));
          } else if (args.name === null) {
            // Intentionaly unset;
            files.clear();
          } else {
            // Undefined, keep the old one
            const [file, fileName] = await getFileFromUrl(image!, "untitled");
            imageName = fileName;
            files.set(fileName, Buffer.from(file as any));
          }

          setLoadingState("submit-solana");
          const { files: presignedFiles, txid } =
            await tokenMetadataSdk!.presignCreateArweaveUrl({
              name: args.name,
              symbol: args.symbol,
              image: imageName,
              files,
              env: "mainnet-beta",
              uploadUrl: ARWEAVE_UPLOAD_URL,
            });

          setLoadingState("submit-arweave");
          arweaveLink = await tokenMetadataSdk!.getArweaveUrl({
            txid,
            mint: tokenRef!.mint,
            files: presignedFiles,
            env: "mainnet-beta",
          });
        } else {
          arweaveLink = metadata?.data.uri as string;
        }

        setLoadingState("submit-solana");
        const { instructions: updateTokenBondingInstructions } =
          await tokenCollectiveSdk!.updateTokenBondingInstructions({
            tokenRef: tokenRef!.publicKey,
            buyBaseRoyaltyPercentage: args.buyBaseRoyaltyPercentage,
            buyTargetRoyaltyPercentage: args.buyTargetRoyaltyPercentage,
            sellBaseRoyaltyPercentage: args.sellBaseRoyaltyPercentage,
            sellTargetRoyaltyPercentage: args.sellTargetRoyaltyPercentage,
          });

        const { instructions: updateMetadataInstructions } =
          await tokenMetadataSdk!.updateMetadataInstructions({
            metadata: tokenRef!.tokenMetadata,
            data: new Data({
              name: args.name,
              symbol: args.symbol,
              uri: arweaveLink,
              sellerFeeBasisPoints: 0,
              creators: null,
            }),
          });

        const transaction = new Transaction({
          feePayer: walletKey || undefined,
          recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
        });

        transaction.instructions = [
          ...updateTokenBondingInstructions,
          ...updateMetadataInstructions,
        ];

        const prepayTxn = await signTransaction(transaction);
        const txId = await sendAndConfirmRawTransaction(
          connection,
          prepayTxn.serialize()
        );
        await connection.confirmTransaction(txId, "max");

        setData(metadataAccountKey);
      } finally {
        setLoading(false);
        setLoadingState("idle");
      }
    }
  };

  const { execute, error } = useAsyncCallback(exec);
  return [
    execute,
    { data, loading, loadingState, error: tokenMetadataError || error },
  ];
};
