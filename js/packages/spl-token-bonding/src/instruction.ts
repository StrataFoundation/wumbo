import {
  Account,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { Numberu16 } from "./utils";
import { Numberu64 } from "@bonfida/spl-name-service";
import BN from "bn.js";
import { serialize } from "borsh";

export class CreateLogCurveV0Args {
  instruction: number = 0;
  g: BN;
  c: BN;
  taylorIterations: number;
  isBaseRelative: boolean;

  constructor(args: { g: BN, c: BN, taylorIterations: number, isBaseRelative: boolean }) {
    this.g = args.g;
    this.c = args.c;
    this.taylorIterations = args.taylorIterations;
    this.isBaseRelative = args.isBaseRelative;
  }
}

export class InitializeTokenBondingV0Args {
  instruction: number = 1;
  founderRewardPercentage: number;
  mintCap: BN | undefined;
  tokenBondingAuthority: PublicKey | undefined

  constructor(args: { founderRewardPercentage: number, mintCap: BN | undefined, tokenBondingAuthority: PublicKey | undefined }) {
    this.founderRewardPercentage = args.founderRewardPercentage;
    this.mintCap = args.mintCap;
    this.tokenBondingAuthority = args.tokenBondingAuthority;
  }
}

export class BuyV0Args {
  instruction: number = 2;
  amount: BN;
  maxPrice: BN;

  constructor(args: { amount: BN, maxPrice: BN }) {
    this.amount = args.amount;
    this.maxPrice = args.maxPrice;
  }
}

export class SellV0Args {
  instruction: number = 2;
  amount: BN;
  minPrice: BN;

  constructor(args: { amount: BN, minPrice: BN }) {
    this.amount = args.amount;
    this.minPrice = args.minPrice
  }
}

export const TOKEN_BONDING_INSTRUCTION_SCHEMA = new Map<any, any>([
  [
    CreateLogCurveV0Args,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['g', 'u128'],
        ['c', 'u128'],
        ['taylorIterations', 'u16'],
        ['isBaseRelative', 'u8'], // boolean
      ],
    },
  ],
  [
    InitializeTokenBondingV0Args,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['founderRewardPercentage', 'u16'],
        ['mintCap', { kind: 'option', type: 'u64' }],
        ['tokenBondingAuthority', { kind: 'option', type: 'pubkey' }],
      ],
    },
  ],
  [
    BuyV0Args,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['amount', 'u64'],
        ['maxPrice', 'u64'],
      ],
    },
  ],
  [
    SellV0Args,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['amount', 'u64'],
        ['minPrice', 'u64'],
      ],
    },
  ],
]);

export function initializeTokenBondingV0Instruction(
  programId: PublicKey,
  tokenProgramId: PublicKey,
  payer: PublicKey,
  tokenBondingAccount: PublicKey,
  tokenBondingAuthority: PublicKey | null,
  curve: PublicKey,
  baseMint: PublicKey,
  targetMint: PublicKey,
  founderRewards: PublicKey,
  baseStorage: PublicKey,
  baseStorageAuthority: PublicKey,
  founderRewardsPercentage: number,
  mintCap?: number
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
        isSigner: false,
        isWritable: true,
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
        isWritable: true,
      },
      {
        pubkey: baseStorageAuthority,
        isSigner: false,
        isWritable: false,
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
      {
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.from(serialize(TOKEN_BONDING_INSTRUCTION_SCHEMA, new InitializeTokenBondingV0Args({
      founderRewardPercentage: founderRewardsPercentage,
      mintCap: mintCap ? new Numberu64(mintCap) : undefined,
      tokenBondingAuthority: tokenBondingAuthority || undefined
    })))
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
  amount: number,
  maxPrice: number
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
    data: Buffer.from(serialize(TOKEN_BONDING_INSTRUCTION_SCHEMA, new BuyV0Args({
      amount: new Numberu64(amount),
      maxPrice: new Numberu64(maxPrice)
    })))
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
  amount: number,
  minPrice: number
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
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.from(serialize(TOKEN_BONDING_INSTRUCTION_SCHEMA, new SellV0Args({
      amount: new Numberu64(amount),
      minPrice: new Numberu64(minPrice)
    })))
  });
}
