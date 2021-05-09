import {PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction} from "@solana/web3.js";
import {Numberu16, Numberu8} from "./utils";

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
      }
    ],
    data: Buffer.concat([
      Buffer.from(Int8Array.from([1])),
      new Numberu16(nonce).toBuffer(),
      new Numberu8(nonce).toBuffer()
    ])
  })
}