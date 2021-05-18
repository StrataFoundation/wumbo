import React from "react";
import {SolcloutCreator} from "../solclout-api/state";
import {buyCreatorCoinsWithWallet, sellCreatorCoinsWithWallet} from "../solclout-api/bindings";
import {KEYPAIR, SOLCLOUT_PROGRAM_ID, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID} from "../globals";
import {Account, Connection} from "@solana/web3.js";


export const buy = (connection: Connection, creator: SolcloutCreator, amount: number): Promise<void> => {
  return buyCreatorCoinsWithWallet(connection, {
    programId: SOLCLOUT_PROGRAM_ID,
    splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    solcloutCreator: creator.publicKey,
    purchaserWallet: new Account(KEYPAIR.secretKey),
    lamports: Math.floor(amount * Math.pow(10, 9))
  })
}

export const sell = (connection: Connection, creator: SolcloutCreator, amount: number): Promise<void> => {
  return sellCreatorCoinsWithWallet(connection, {
    programId: SOLCLOUT_PROGRAM_ID,
    splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    solcloutCreator: creator.publicKey,
    sellerWallet: new Account(KEYPAIR.secretKey),
    lamports: Math.floor(amount * Math.pow(10, 9))
  })
}
