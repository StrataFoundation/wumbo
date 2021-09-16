import React, { useState, useCallback } from "react";
import { useConnection } from "@oyster/common";
import { PublicKey, Transaction, sendAndConfirmRawTransaction } from "@solana/web3.js";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import {
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  TOKEN_BONDING_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  usePrograms,
  useWallet,
} from "wumbo-common";
import BN from "bn.js";

export const useBuy = (): [
  (tokenBonding: PublicKey, amount: number, maxPrice: number) => Promise<void>,
  { data: any; loading: boolean; error: Error | undefined }
] => {
  const connection = useConnection();
  const { connected, signTransaction, publicKey } = useWallet();
  // TODO fix data type;
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();
  const { splTokenBondingProgram } = usePrograms();

  const buy = useCallback(
    async (tokenBonding, amount, slippage) => {
      if (!connected || !publicKey) throw new WalletNotConnectedError();
      setLoading(true);

      try {
        const { instructions, signers } = await splTokenBondingProgram!.buyV0Instructions({
          tokenBonding,
          desiredTargetAmount: new BN(Math.floor(amount * Math.pow(10, 9))),
          slippage
        });

        const transaction = new Transaction({
          feePayer: publicKey,
          recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
        });
        transaction.add(...instructions)
        signers.length > 0 && transaction.partialSign(...signers)
        const signed = await signTransaction(transaction);
        const data = await sendAndConfirmRawTransaction(connection, signed.serialize());
        setData(data);
      } finally {
        setLoading(false);
      }
    },
    [connected, publicKey, setLoading, setError]
  );

  return [buy, { data, loading, error }];
};

export const useSell = (): [
  (tokenBonding: PublicKey, amount: number, minPrice: number) => Promise<void>,
  { data: any; loading: boolean; error: Error | undefined }
] => {
  const connection = useConnection();
  const { connected, publicKey, signTransaction } = useWallet();
  // TODO fix data type;
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();
  const { splTokenBondingProgram } = usePrograms();

  const sell = useCallback(
    async (tokenBonding, amount, slippage) => {
      if (!connected || !publicKey) throw new WalletNotConnectedError();
      setLoading(true);

      try {
        const { instructions, signers } = await splTokenBondingProgram!.sellV0Instructions({
          tokenBonding,
          targetAmount: new BN(Math.floor(amount * Math.pow(10, 9))),
          slippage
        });

        const transaction = new Transaction({
          feePayer: publicKey,
          recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
        });

        transaction.add(...instructions);
        signers.length > 0 && transaction.partialSign(...signers)

        const signed = await signTransaction(transaction);
        const data = await sendAndConfirmRawTransaction(connection, signed.serialize());
        setData(data);
      } finally {
        setLoading(false);
      }
    },
    [connected, publicKey, setLoading, setError]
  );

  return [sell, { data, loading, error }];
};
