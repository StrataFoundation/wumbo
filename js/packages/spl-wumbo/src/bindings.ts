import {
  Account,
  Connection,
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  getHashedName,
  getNameAccountKey,
  NameRegistryState,
} from "@bonfida/spl-name-service";
import { Token, MintLayout } from "@solana/spl-token";
import { initializeCreatorInstruction } from "./instruction";
import { Mint, WumboCreator, WumboInstance } from "./state";
import { initializeTokenBondingV0Instruction } from "spl-token-bonding";
import { TokenBondingV0 } from "spl-token-bonding";
import { WalletAdapter } from "@solana/wallet-base";

export const SOL_TOKEN = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

export type CreateWumboCreatorParams = {
  splWumboProgramId: PublicKey;
  splNameServicePogramId: PublicKey;
  splTokenProgramId: PublicKey;
  splTokenBondingProgramId: PublicKey;
  splAssociatedTokenAccountProgramId: PublicKey;
  wumboInstance: PublicKey;
  payer: WalletAdapter;
  baseMint: PublicKey;
  founderRewardsPercentage: number;
  name: string;
  nameClass?: PublicKey;
  nameParent?: PublicKey;
};

async function sendTransaction(
  connection: Connection,
  instructions: TransactionInstruction[],
  wallet: WalletAdapter,
  extraSigners?: Account[]
): Promise<void> {
  const transaction = new Transaction({
    feePayer: wallet.publicKey || undefined,
    recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
  });
  transaction.instructions = instructions;

  extraSigners && transaction.partialSign(...extraSigners);
  const signed = await wallet.signTransaction(transaction);

  await sendAndConfirmRawTransaction(connection, signed.serialize());
}

interface CreateCreatorResult {
  creatorKey: PublicKey;
  tokenBondingKey: PublicKey;
}
export async function createWumboCreator(
  connection: Connection,
  params: CreateWumboCreatorParams
): Promise<CreateCreatorResult> {
  if (!params.payer.publicKey) {
    throw new Error("Invalid payer");
  }

  const hashedName = await getHashedName(params.name);
  const nameKey = await getNameAccountKey(
    hashedName,
    params.nameClass,
    params.nameParent
  );

  const instructions = [];

  // Create creator coin
  const targetMint = new Account();
  const [targetAuthority, targetNonce] = await PublicKey.findProgramAddress(
    [Buffer.from("target-authority", "utf8"), targetMint.publicKey.toBuffer()],
    params.splTokenBondingProgramId
  );

  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: params.payer.publicKey,
      newAccountPubkey: targetMint.publicKey,
      lamports: await Token.getMinBalanceRentForExemptMint(connection),
      space: MintLayout.span,
      programId: params.splTokenProgramId,
    })
  );

  instructions.push(
    Token.createInitMintInstruction(
      params.splTokenProgramId,
      targetMint.publicKey,
      9,
      targetAuthority,
      targetAuthority
    )
  );

  console.log(`Added creator mint ${targetMint.publicKey}`);

  const [creator, nonce] = await PublicKey.findProgramAddress(
    [
      Buffer.from("creator", "utf-8"),
      params.wumboInstance.toBuffer(),
      nameKey.toBuffer(),
    ],
    params.splWumboProgramId
  );

  // Create founder rewards
  // If the person has already claimed their twitter handle, set the founder rewards account owner to
  // their wallet. Otherwise, set to the authority so wumbo can transfer the account to them later.
  let founderRewardsOwner, nameExists;
  try {
    const nameRegistryState = await NameRegistryState.retrieve(
      connection,
      nameKey
    );
    founderRewardsOwner = nameRegistryState.owner;
    nameExists = true;
  } catch {
    [founderRewardsOwner] = await PublicKey.findProgramAddress(
      [Buffer.from("founder-rewards", "utf-8"), creator.toBuffer()],
      params.splWumboProgramId
    );
    nameExists = false;
  }

  console.log(`Set founder rewards account owner to ${founderRewardsOwner}`);

  const associatedFounderRewardsAddress = await Token.getAssociatedTokenAddress(
    params.splAssociatedTokenAccountProgramId,
    params.splTokenProgramId,
    targetMint.publicKey,
    founderRewardsOwner,
    // @ts-ignore
    true
  );

  instructions.push(
    Token.createAssociatedTokenAccountInstruction(
      params.splAssociatedTokenAccountProgramId,
      params.splTokenProgramId,
      targetMint.publicKey,
      associatedFounderRewardsAddress,
      founderRewardsOwner,
      params.payer.publicKey
    )
  );

  const tokenBonding = new Account();
  const [tokenBondingAuthority, _] = await PublicKey.findProgramAddress(
    [Buffer.from("bonding-authority", "utf-8"), creator.toBuffer()],
    params.splWumboProgramId
  );
  const wumboInstance = await WumboInstance.retrieve(
    connection,
    params.wumboInstance
  );
  const balance = await connection.getMinimumBalanceForRentExemption(
    TokenBondingV0.LEN
  );

  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: params.payer.publicKey,
      newAccountPubkey: tokenBonding.publicKey,
      lamports: balance,
      space: TokenBondingV0.LEN,
      programId: params.splTokenBondingProgramId,
    })
  );

  // Setup base storage
  const [baseStorageKey] = await PublicKey.findProgramAddress(
    [
      Buffer.from("base-storage-key", "utf8"),
      tokenBonding.publicKey.toBuffer(),
    ],
    params.splTokenBondingProgramId
  );
  const [storageAuthority, storageNonce] = await PublicKey.findProgramAddress(
    [Buffer.from("base-storage-authority", "utf8"), baseStorageKey.toBuffer()],
    params.splTokenBondingProgramId
  );

  instructions.push(
    initializeTokenBondingV0Instruction(
      params.splTokenBondingProgramId,
      params.splTokenProgramId,
      params.payer.publicKey,
      tokenBonding.publicKey,
      tokenBondingAuthority,
      wumboInstance.baseCurve,
      params.baseMint,
      targetMint.publicKey,
      associatedFounderRewardsAddress,
      baseStorageKey,
      storageAuthority,
      (params.founderRewardsPercentage / 100) * 10000
    )
  );

  // Associate creator coin with name
  instructions.push(
    initializeCreatorInstruction(
      params.splWumboProgramId,
      params.payer.publicKey,
      creator,
      params.wumboInstance,
      nameKey,
      associatedFounderRewardsAddress,
      tokenBonding.publicKey,
      nameExists ? founderRewardsOwner : undefined
    )
  );

  await sendTransaction(connection, instructions, params.payer, [
    targetMint,
    tokenBonding,
  ]);

  console.log(
    `Created creator with key ${creator}, founder rewards account ${associatedFounderRewardsAddress}, token bonding ${tokenBonding.publicKey} and mint ${targetMint.publicKey}`
  );

  return {
    creatorKey: creator,
    tokenBondingKey: tokenBonding.publicKey,
  };
}
