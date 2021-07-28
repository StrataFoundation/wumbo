import {
  TOKEN_BONDING_PROGRAM_ID,
  WUMBO_PROGRAM_ID,
} from "../../constants/globals";
import {
  Data,
  findProgramAddress,
  METADATA_SCHEMA,
  programIds,
} from "@oyster/common";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { serialize } from "borsh";

// @ts-ignore
const it = METADATA_SCHEMA.keys();
const CreateMetadataArgs = it.next().value;
const UpdateMetadataArgs = it.next().value;
export async function createTokenBondingMetadata(
  data: Data,
  updateAuthority: PublicKey,
  mintKey: PublicKey,
  tokenRef: PublicKey,
  tokenRefOwner: PublicKey,
  tokenBonding: PublicKey,
  tokenBondingAuthority: PublicKey,
  mintAuthorityKey: PublicKey,
  instructions: TransactionInstruction[],
  payer: PublicKey
) {
  const metadataProgramId = programIds().metadata;

  const metadataAccount = (
    await findProgramAddress(
      [
        Buffer.from("metadata"),
        metadataProgramId.toBuffer(),
        mintKey.toBuffer(),
      ],
      metadataProgramId
    )
  )[0];
  console.log("Data", data);
  const value = new CreateMetadataArgs({ data, isMutable: true });
  value.instruction = 4;
  const txnData = Buffer.from(serialize(METADATA_SCHEMA, value));

  const keys = [
    {
      pubkey: tokenRef,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: tokenRefOwner,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: tokenBonding,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: tokenBondingAuthority,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: TOKEN_BONDING_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: metadataProgramId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: metadataAccount,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: mintKey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: mintAuthorityKey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: payer,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: updateAuthority,
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
  instructions.push(
    new TransactionInstruction({
      keys,
      programId: WUMBO_PROGRAM_ID,
      data: txnData,
    })
  );

  return metadataAccount;
}

export async function updateMetadata(
  data: Data | undefined,
  tokenRef: PublicKey,
  tokenRefOwner: PublicKey,
  newUpdateAuthority: string | undefined,
  primarySaleHappened: boolean | null | undefined,
  mintKey: PublicKey,
  updateAuthority: PublicKey,
  instructions: TransactionInstruction[],
  metadataAccount?: PublicKey
) {
  const metadataProgramId = programIds().metadata;

  metadataAccount =
    metadataAccount ||
    (
      await findProgramAddress(
        [
          Buffer.from("metadata"),
          metadataProgramId.toBuffer(),
          mintKey.toBuffer(),
        ],
        metadataProgramId
      )
    )[0];

  const value = new UpdateMetadataArgs({
    data,
    updateAuthority: !newUpdateAuthority ? undefined : newUpdateAuthority,
    primarySaleHappened:
      primarySaleHappened === null || primarySaleHappened === undefined
        ? null
        : primarySaleHappened,
  });
  value.instruction = 5;
  const txnData = Buffer.from(serialize(METADATA_SCHEMA, value));
  const keys = [
    {
      pubkey: tokenRef,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: tokenRefOwner,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: metadataProgramId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: metadataAccount,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: updateAuthority,
      isSigner: false,
      isWritable: false,
    },
  ];
  instructions.push(
    new TransactionInstruction({
      keys,
      programId: WUMBO_PROGRAM_ID,
      data: txnData,
    })
  );

  return metadataAccount;
}
