import {
  Account,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";

export function initializeCreatorInstruction(
  programId: PublicKey,
  payer: PublicKey,
  tokenRef: PublicKey,
  reverseTokenRef: PublicKey,
  wumboInstance: PublicKey,
  name: PublicKey,
  founderRewardsAccount: PublicKey,
  tokenBonding: PublicKey,
  nameOwner?: PublicKey
): TransactionInstruction {
  const keys = [
    {
      pubkey: payer,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: tokenRef,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: reverseTokenRef,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: wumboInstance,
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
      pubkey: tokenBonding,
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
  ];
  if (nameOwner) {
    keys.push({
      pubkey: nameOwner,
      isSigner: true,
      isWritable: false,
    });
  }
  return new TransactionInstruction({
    programId,
    keys,
    data: Buffer.concat([Buffer.from(Int8Array.from([1]))]),
  });
}
