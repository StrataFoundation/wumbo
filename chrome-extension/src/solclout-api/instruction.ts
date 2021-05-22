import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { Numberu16, Numberu8 } from "./utils";
import { Numberu64 } from "@bonfida/spl-name-service";

export function initializeCreatorInstruction(
  programId: PublicKey,
  payer: PublicKey,
  solcloutAccount: PublicKey,
  solcloutInstance: PublicKey,
  name: PublicKey,
  founderRewardsAccount: PublicKey,
  creatorMint: PublicKey,
  founderRewardPercentage: number,
  nonce: number
): TransactionInstruction {
  return new TransactionInstruction({
    programId,
    keys: [
      {
        pubkey: payer,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: solcloutAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: solcloutInstance,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: name,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: founderRewardsAccount,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: creatorMint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.concat([
      Buffer.from(Int8Array.from([1])),
      new Numberu16(nonce).toBuffer(),
      new Numberu8(nonce).toBuffer(),
    ]),
  });
}

export function buyCreatorCoinsInstruction(
  programId: PublicKey,
  tokenProgramId: PublicKey,
  solcloutInstance: PublicKey,
  solcloutCreator: PublicKey,
  creatorMint: PublicKey,
  creatorMintAuthority: PublicKey,
  solcloutStorageAccount: PublicKey,
  founderRewardsAccount: PublicKey,
  purchaseAccount: PublicKey,
  purchaseAuthority: PublicKey,
  destination: PublicKey,
  lamports: number
): TransactionInstruction {
  return new TransactionInstruction({
    programId,
    keys: [
      {
        pubkey: solcloutInstance,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: solcloutCreator,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: creatorMint,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: creatorMintAuthority,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: solcloutStorageAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: founderRewardsAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: purchaseAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: purchaseAuthority,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: destination,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: tokenProgramId,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.concat([
      Buffer.from(Int8Array.from([2])),
      new Numberu64(lamports).toBuffer(),
    ]),
  });
}

export function sellCreatorCoinsInstruction(
  programId: PublicKey,
  tokenProgramId: PublicKey,
  solcloutInstance: PublicKey,
  solcloutCreator: PublicKey,
  creatorMint: PublicKey,
  solcloutStorageAccount: PublicKey,
  solcloutStorageAuthority: PublicKey,
  sellAccount: PublicKey,
  sellAuthority: PublicKey,
  destination: PublicKey,
  lamports: number
): TransactionInstruction {
  return new TransactionInstruction({
    programId,
    keys: [
      {
        pubkey: solcloutInstance,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: solcloutCreator,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: creatorMint,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: solcloutStorageAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: solcloutStorageAuthority,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: sellAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: sellAuthority,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: destination,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: tokenProgramId,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.concat([
      Buffer.from(Int8Array.from([3])),
      new Numberu64(lamports).toBuffer(),
    ]),
  });
}
