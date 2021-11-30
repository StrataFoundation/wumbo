import { useState } from "react";
import { useAsyncCallback } from "react-async-hook";
import { useConnection, Creator, MetadataCategory } from "@oyster/common";
import {
  Connection,
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  useStrataSdks,
  useTokenMetadata,
  useTokenRef,
  useTokenBonding,
} from "@strata-foundation/react";
import { percent } from "@strata-foundation/spl-utils";
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

export const useSetMetadata = (
  tokenRefKey: PublicKey | undefined
): [
  (args: ISetMetadataArgs) => Promise<{ metadataAccount: PublicKey } | void>,
  {
    data: any;
    loading: boolean;
    loadingState: MetadataFiniteState;
    error: Error | undefined;
  }
] => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<MetadataFiniteState>("idle");
  const [data, setData] = useState();
  const [error, setError] = useState<Error | undefined>();

  return [, { data, loading, loadingState, error }];
};
