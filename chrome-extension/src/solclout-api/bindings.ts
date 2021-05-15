import {Account, Connection, PublicKey, sendAndConfirmTransaction, Transaction} from "@solana/web3.js";
import {getHashedName, getNameAccountKey, NameRegistryState} from "@bonfida/spl-name-service";
import {Token} from "@solana/spl-token"
import {buyCreatorCoinsInstruction, initializeCreatorInstruction} from "./instruction";
import {SolcloutCreator, SolcloutInstance} from "./state";

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

export type BuyCreatorCoinsWithWalletParams = {
  programId: PublicKey,
  splAssociatedTokenAccountProgramId: PublicKey,
  solcloutCreator: PublicKey,
  purchaserWallet: Account,
  lamports: number
}

export async function createSolcloutCreator(connection: Connection, params: CreateSolcloutCreatorParams): Promise<void> {
  const hashedName = await getHashedName(params.name)
  const nameKey = await getNameAccountKey(hashedName, params.nameClass, params.nameParent)
  const [solcloutCreator, _] = await PublicKey.findProgramAddress(
    [params.solcloutInstance.toBuffer(), nameKey.toBuffer()],
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

async function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey,
  tokenProgramId: PublicKey,
  splAssociatedTokenAccountProgramId: PublicKey
): Promise<PublicKey> {
  return (await PublicKey.findProgramAddress(
    [
      walletAddress.toBuffer(),
      tokenProgramId.toBuffer(),
      tokenMintAddress.toBuffer(),
    ],
    splAssociatedTokenAccountProgramId
  ))[0];
}

export async function buyCreatorCoinsWithWallet(connection: Connection, params: BuyCreatorCoinsWithWalletParams): Promise<void> {
  const creator = await SolcloutCreator.retrieve(connection, params.solcloutCreator);
  if (!creator) {
    throw new Error("Creator not found")
  }
  if (params.lamports < 0) {
    throw new Error("Amount must be positive")
  }

  const solcloutInstance = await SolcloutInstance.retrieve(connection, creator.solcloutInstance);
  const purchaseAccount = await findAssociatedTokenAddress(
    params.purchaserWallet.publicKey,
    solcloutInstance.solcloutToken,
    solcloutInstance.tokenProgramId,
    params.splAssociatedTokenAccountProgramId
  )
  const destinationAccount = await findAssociatedTokenAddress(
    params.purchaserWallet.publicKey,
    creator.creatorToken,
    solcloutInstance.tokenProgramId,
    params.splAssociatedTokenAccountProgramId
  )
  const acctExists = await connection.getAccountInfo(destinationAccount)
  if (!acctExists) {
    console.log("Creating destination account...")
    await new Token(
      connection,
      creator.creatorToken,
      solcloutInstance.tokenProgramId,
      params.purchaserWallet
    ).createAssociatedTokenAccount(params.purchaserWallet.publicKey);
    console.log(`Destination account created: ${destinationAccount}`)
  }

  const [creatorMintAuthority, _] = await PublicKey.findProgramAddress([params.solcloutCreator.toBuffer()], params.programId)

  const transaction = new Transaction()
    .add(buyCreatorCoinsInstruction(
      params.programId,
      solcloutInstance.tokenProgramId,
      creator.solcloutInstance,
      params.solcloutCreator,
      creator.creatorToken,
      creatorMintAuthority,
      solcloutInstance.solcloutStorage,
      creator.founderRewardsAccount,
      purchaseAccount,
      params.purchaserWallet,
      destinationAccount,
      params.lamports
    ))

  await sendAndConfirmTransaction(
    connection,
    transaction,
    [params.purchaserWallet],
    { commitment: "singleGossip", preflightCommitment: "singleGossip" }
  );

  console.log(`Bought ${params.lamports} creator coins from ${purchaseAccount} to ${destinationAccount}`)
}