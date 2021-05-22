import React from "react";
import { SolcloutCreator } from "../solclout-api/state";
import {
  buyCreatorCoinsWithWallet,
  sellCreatorCoinsWithWallet,
} from "../solclout-api/bindings";
import {
  SOLCLOUT_PROGRAM_ID,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
} from "../constants/globals";
import { Connection } from "@solana/web3.js";
import { WalletAdapter } from "@solana/wallet-base";

export const buy = (wallet?: WalletAdapter) => (
  connection: Connection,
  creator: SolcloutCreator,
  amount: number
): Promise<void> => {
  if (wallet) {
    return buyCreatorCoinsWithWallet(connection, {
      programId: SOLCLOUT_PROGRAM_ID,
      splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      solcloutCreator: creator.publicKey,
      purchaserWallet: wallet,
      lamports: Math.floor(amount * Math.pow(10, 9)),
    });
  }

  return Promise.resolve();
};

export const sell = (wallet?: WalletAdapter) => (
  connection: Connection,
  creator: SolcloutCreator,
  amount: number
): Promise<void> => {
  if (wallet) {
    return sellCreatorCoinsWithWallet(connection, {
      programId: SOLCLOUT_PROGRAM_ID,
      splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      solcloutCreator: creator.publicKey,
      sellerWallet: wallet,
      lamports: Math.floor(amount * Math.pow(10, 9)),
    });
  }

  return Promise.resolve();
};
