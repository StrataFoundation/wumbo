import {
  Account,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { Numberu16 } from "./utils";
import { Numberu64 } from "@bonfida/spl-name-service";

export function initializeTokenBondingV0Instruction(
  programId: PublicKey,
  payer: PublicKey,
  tokenBondingAccount: PublicKey,
  tokenBondingAuthority: PublicKey,
  curve: PublicKey,
  baseMint: PublicKey,
  targetMint: PublicKey,
  founderRewards: PublicKey,
  baseStorage: PublicKey,
  founderRewardsPercentage: number
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
        pubkey: tokenBondingAccount,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: tokenBondingAuthority,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: curve,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: baseMint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: targetMint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: founderRewards,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: baseStorage,
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
      new Numberu16(founderRewardsPercentage).toBuffer(),
    ]),
  });
}

export function buyV0Instruction(
  programId: PublicKey,
  tokenProgramId: PublicKey,
  tokenBonding: PublicKey,
  curve: PublicKey,
  baseMint: PublicKey,
  targetMint: PublicKey,
  targetMintAuthority: PublicKey,
  founderRewards: PublicKey,
  baseStorage: PublicKey,
  purchaseAccount: PublicKey,
  purchaseAuthority: PublicKey,
  destination: PublicKey,
  amount: number
): TransactionInstruction {
  return new TransactionInstruction({
    programId,
    keys: [
      {
        pubkey: tokenBonding,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: curve,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: baseMint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: targetMint,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: targetMintAuthority,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: founderRewards,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: baseStorage,
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
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.concat([
      Buffer.from(Int8Array.from([2])),
      new Numberu64(amount).toBuffer(),
    ]),
  });
}

export function sellV0Instruction(
  programId: PublicKey,
  tokenProgramId: PublicKey,
  tokenBonding: PublicKey,
  curve: PublicKey,
  baseMint: PublicKey,
  targetMint: PublicKey,
  baseStorage: PublicKey,
  baseStorageAuthority: PublicKey,
  sellAccount: PublicKey,
  sellAuthority: PublicKey,
  destination: PublicKey,
  amount: number
): TransactionInstruction {
  return new TransactionInstruction({
    programId,
    keys: [
      {
        pubkey: tokenBonding,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: curve,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: baseMint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: targetMint,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: baseStorage,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: baseStorageAuthority,
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
      new Numberu64(amount).toBuffer(),
    ]),
  });
}
