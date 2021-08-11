import {
  Account,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { serialize } from "borsh";

export class InitializeWumboV0Args {
  instruction: number = 0;
  nameProgramId: PublicKey;

  constructor(args: { nameProgramId: PublicKey }) {
    this.nameProgramId = args.nameProgramId;
  }
}
export class InitializeSocialTokenV0Args {
  instruction: number = 1;
}

export const WUMBO_INSTRUCTION_SCHEMA = new Map<any, any>([
  [
    InitializeWumboV0Args,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['nameProgramId', 'pubkey'],
      ],
    },
  ],
  [
    InitializeSocialTokenV0Args,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
      ],
    },
  ],
]);


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
    data: Buffer.from(serialize(WUMBO_INSTRUCTION_SCHEMA, new InitializeSocialTokenV0Args()));
  });
}
