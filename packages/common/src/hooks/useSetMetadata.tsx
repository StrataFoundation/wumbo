import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Signer, TransactionInstruction } from "@solana/web3.js";
import {
  useStrataSdks,
  useTokenBonding,
  useTokenMetadata,
  useTokenRef,
} from "@strata-foundation/react";
import { ARWEAVE_UPLOAD_URL, FileOrString } from "@strata-foundation/spl-utils";
import { Creator, DataV2 } from "@metaplex-foundation/mpl-token-metadata";
import { useState } from "react";
import { useAsyncCallback } from "react-async-hook";

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
  (args: ISetMetadataArgs) => Promise<void>,
  {
    loading: boolean;
    loadingState: MetadataFiniteState;
    error: Error | undefined;
  }
] => {
  const { connected, publicKey } = useWallet();
  const { tokenCollectiveSdk, tokenMetadataSdk } = useStrataSdks();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<MetadataFiniteState>("idle");

  const { info: tokenRef } = useTokenRef(tokenRefKey);
  const { info: tokenBonding } = useTokenBonding(tokenRef?.tokenBonding);

  const {
    image,
    metadata,
    data,
    error: tokenMetadataError,
  } = useTokenMetadata(tokenBonding?.targetMint);

  const exec = async (args: ISetMetadataArgs) => {
    if (connected && publicKey && tokenRefKey) {
      setLoading(true);
      setLoadingState("gathering-files");
      let files: File[] = [];
      let existingFiles: FileOrString[] | undefined = [];
      let metadataChanged =
        args.image != undefined ||
        args.name != metadata?.data.name ||
        args.symbol != metadata?.data.symbol;

      // No catch of errors as the useAsyncCallback and return handles it
      try {
        let arweaveLink;
        let creators: Creator[] | null = null;

        if (metadataChanged) {
          let imageName: string | undefined = undefined;

          if (args.image) {
            files = [args.image];
            imageName = args.image.name;
          } else if (args.image === null) {
            // Intentionaly unset;
            files = [];
          } else {
            // Undefined, keep the old one
            imageName = image;
            files = [];
            existingFiles = data?.properties.files;
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
              existingFiles,
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

        let updateTokenBondingInstructions: TransactionInstruction[] = [];
        let updateTokenBondingSigners: Signer[] = [];
        if (tokenRef?.authority) {
          ({
            instructions: updateTokenBondingInstructions,
            signers: updateTokenBondingSigners,
          } = await tokenCollectiveSdk!.updateTokenBondingInstructions({
            tokenRef: tokenRef!.publicKey,
            buyBaseRoyaltyPercentage: args.buyBaseRoyaltyPercentage,
            buyTargetRoyaltyPercentage: args.buyTargetRoyaltyPercentage,
            sellBaseRoyaltyPercentage: args.sellBaseRoyaltyPercentage,
            sellTargetRoyaltyPercentage: args.sellTargetRoyaltyPercentage,
          }));
        }

        const {
          instructions: updateMetadataInstructions,
          signers: updateMetadataSigners,
        } = await tokenMetadataSdk!.updateMetadataInstructions({
          metadata: tokenRef!.tokenMetadata,
          data: new DataV2({
            name: args.name,
            symbol: args.symbol,
            uri: arweaveLink,
            sellerFeeBasisPoints: 0,
            creators,
            uses: null,
            collection: null,
          }),
        });

        await tokenCollectiveSdk?.sendInstructions(
          [...updateTokenBondingInstructions, ...updateMetadataInstructions],
          [...updateTokenBondingSigners, ...updateMetadataSigners]
        );
      } finally {
        setLoading(false);
        setLoadingState("idle");
      }
    }
  };

  const { execute, error } = useAsyncCallback(exec);
  return [
    execute,
    { loading, loadingState, error: tokenMetadataError || error },
  ];
};
