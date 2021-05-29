import React from "react";
import { WumboCreator } from "../wumbo-api/state";
import {
  buyCreatorCoinsWithWallet,
  sellCreatorCoinsWithWallet,
} from "../wumbo-api/bindings";
import {
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  TOKEN_BONDING_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "../constants/globals";
import { Account, Connection } from "@solana/web3.js";
import { WalletAdapter } from "@solana/wallet-base";

export const buy = (wallet: WalletAdapter | undefined) => (
  connection: Connection,
  creator: WumboCreator,
  amount: number
): Promise<void> => {
  if (wallet) {
    return buyCreatorCoinsWithWallet(connection, {
      splTokenBondingProgramId: TOKEN_BONDING_PROGRAM_ID,
      splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      splTokenProgramId: TOKEN_PROGRAM_ID,
      wumboCreator: creator.publicKey,
      purchaserWallet: wallet,
      amount: Math.floor(amount * Math.pow(10, 9)),
    });
  }

  return Promise.resolve();
};

export const sell = (wallet: WalletAdapter | undefined) => (
  connection: Connection,
  creator: WumboCreator,
  amount: number
): Promise<void> => {
  if (wallet) {
    return sellCreatorCoinsWithWallet(connection, {
      splTokenBondingProgramId: TOKEN_BONDING_PROGRAM_ID,
      splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      splTokenProgramId: TOKEN_PROGRAM_ID,
      wumboCreator: creator.publicKey,
      sellerWallet: wallet,
      amount: Math.floor(amount * Math.pow(10, 9)),
    });
  }

  return Promise.resolve();
};
