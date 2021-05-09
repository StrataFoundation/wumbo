import {Account, Connection, PublicKey, sendAndConfirmTransaction, Transaction} from "@solana/web3.js";
import {getHashedName, getNameAccountKey, NameRegistryState} from "@bonfida/spl-name-service";
import {Token} from "@solana/spl-token"
import {initializeCreatorInstruction} from "./instruction";
import {SolcloutCreator} from "./state";

export type CreateSolcloutCreatorParams = {
  programId: PublicKey,
  tokenProgramId: PublicKey,
  payer: Account,
  solcloutInstance: PublicKey,
  name: string,
  founderRewardsPercentage: number,
  nameClass?: PublicKey,
  nameParent?: PublicKey,
};

export async function createSolcloutCreator(connection: Connection, params: CreateSolcloutCreatorParams): Promise<void> {
  const hashedName = await getHashedName(params.name)
  const nameKey = await getNameAccountKey(hashedName, params.nameClass, params.nameParent)
  const [solcloutCreator, _] = await PublicKey.findProgramAddress(
    [nameKey.toBuffer()],
    params.programId
  )
  const [authority, nonce] = await PublicKey.findProgramAddress(
    [solcloutCreator.toBuffer()],
    params.programId
  )

  const existing = await connection.getAccountInfo(
    solcloutCreator,
    'processed',
  );
  if (existing) {
    throw new Error("Solclout creator already exists")
  }

  const creatorMint = await Token.createMint(
    connection,
    params.payer,
    authority,
    authority,
    9,
    params.tokenProgramId
  )

  console.log(`Created creator mint ${creatorMint.publicKey}`)

  // If the person has already claimed their twitter handle, set the founder rewards account owner to
  // their wallet. Otherwise, set to the authority so solclout can transfer the account to them later.
  let tokenOwner = authority
  try {
    const nameRegistryState = await NameRegistryState.retrieve(connection, nameKey)
    tokenOwner = nameRegistryState.owner
  } catch {
    // Do nothing, token owner already properly set
  }

  console.log(`Set founder rewards account owner to ${tokenOwner}`)

  const founderRewardsAccount = await creatorMint.createAssociatedTokenAccount(tokenOwner)
  const transaction = new Transaction()
    .add(initializeCreatorInstruction(
      params.programId,
      params.payer.publicKey,
      solcloutCreator,
      params.solcloutInstance,
      nameKey,
      founderRewardsAccount,
      creatorMint.publicKey,
      (params.founderRewardsPercentage / 100) * 10000,
      nonce
    ));

  await sendAndConfirmTransaction(
    connection,
    transaction,
    [params.payer],
    { commitment: "singleGossip", preflightCommitment: "singleGossip" }
  );

  console.log(`Created creator with key ${solcloutCreator}, founder rewards account ${founderRewardsAccount}`)
}