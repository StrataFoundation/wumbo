import {
  Account,
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
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
import { Token, MintLayout, AccountLayout } from "@solana/spl-token";
import { initializeCreatorInstruction } from "./instruction";
import { WumboCreator, WumboInstance } from "./state";
import { initializeTokenBondingV0Instruction } from "../spl-token-bonding-api/instruction";
import {
  buyV0Instruction,
  sellV0Instruction,
} from "../spl-token-bonding-api/instruction";
import { TokenBondingV0 } from "../spl-token-bonding-api/state";
import { WalletAdapter } from "@solana/wallet-base";

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

export type BuyCreatorCoinsWithWalletParams = {
  splTokenBondingProgramId: PublicKey;
  splAssociatedTokenAccountProgramId: PublicKey;
  splTokenProgramId: PublicKey;
  wumboCreator: PublicKey;
  purchaserWallet: WalletAdapter;
  amount: number;
};

export type SellCreatorCoinsWithWalletParams = {
  splTokenBondingProgramId: PublicKey;
  splAssociatedTokenAccountProgramId: PublicKey;
  splTokenProgramId: PublicKey;
  wumboCreator: PublicKey;
  sellerWallet: WalletAdapter;
  amount: number;
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

export async function createWumboCreator(
  connection: Connection,
  params: CreateWumboCreatorParams
): Promise<void> {
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
    founderRewardsOwner
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

  // Create base storage
  const baseStorage = new Account();
  const [storageAuthority, storageNonce] = await PublicKey.findProgramAddress(
    [
      Buffer.from("base-storage-authority", "utf8"),
      baseStorage.publicKey.toBuffer(),
    ],
    params.splTokenBondingProgramId
  );
  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: params.payer.publicKey,
      newAccountPubkey: baseStorage.publicKey,
      lamports: await Token.getMinBalanceRentForExemptAccount(connection),
      space: AccountLayout.span,
      programId: params.splTokenProgramId,
    })
  );
  instructions.push(
    Token.createInitAccountInstruction(
      params.splTokenProgramId,
      params.baseMint,
      baseStorage.publicKey,
      storageAuthority
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

  instructions.push(
    initializeTokenBondingV0Instruction(
      params.splTokenBondingProgramId,
      params.payer.publicKey,
      tokenBonding.publicKey,
      tokenBondingAuthority,
      wumboInstance.baseCurve,
      params.baseMint,
      targetMint.publicKey,
      associatedFounderRewardsAddress,
      baseStorage.publicKey,
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
    baseStorage,
    targetMint,
    tokenBonding,
  ]);

  console.log(
    `Created creator with key ${creator}, founder rewards account ${associatedFounderRewardsAddress}, token bonding ${tokenBonding.publicKey} and mint ${targetMint.publicKey}`
  );
}

async function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey,
  tokenProgramId: PublicKey,
  splAssociatedTokenAccountProgramId: PublicKey
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        tokenProgramId.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      splAssociatedTokenAccountProgramId
    )
  )[0];
}

async function createAssociatedTokenAccountInstruction(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  tokenProgramId: PublicKey,
  associatedTokenProgramId: PublicKey
): Promise<TransactionInstruction> {
  const associatedToken = await Token.getAssociatedTokenAddress(
    associatedTokenProgramId,
    tokenProgramId,
    mint,
    owner
  );

  return Token.createAssociatedTokenAccountInstruction(
    associatedTokenProgramId,
    tokenProgramId,
    mint,
    associatedToken,
    owner,
    owner
  );
}
export async function buyCreatorCoinsWithWallet(
  connection: Connection,
  params: BuyCreatorCoinsWithWalletParams
): Promise<void> {
  if (!params.purchaserWallet.publicKey) {
    throw new Error("Invalid purchaser wallet");
  }

  const creator = await WumboCreator.retrieve(connection, params.wumboCreator);
  if (!creator) {
    throw new Error("Creator not found");
  }
  if (params.amount < 0) {
    throw new Error("Amount must be positive");
  }

  const tokenBonding = await TokenBondingV0.retrieve(
    connection,
    creator.tokenBonding
  );

  if (!tokenBonding) {
    throw new Error(`No token bonding at ${creator.tokenBonding}`);
  }

  const instructions = [];

  const wumboInstance = await WumboInstance.retrieve(
    connection,
    creator.wumboInstance
  );

  const purchaseAccount = await findAssociatedTokenAddress(
    params.purchaserWallet.publicKey,
    wumboInstance.wumboMint,
    params.splTokenProgramId,
    params.splAssociatedTokenAccountProgramId
  );
  const destinationAccount = await findAssociatedTokenAddress(
    params.purchaserWallet.publicKey,
    tokenBonding.targetMint,
    params.splTokenProgramId,
    params.splAssociatedTokenAccountProgramId
  );
  const acctExists = await connection.getAccountInfo(destinationAccount);
  if (!acctExists) {
    console.log("Creating destination account...");
    instructions.push(
      await createAssociatedTokenAccountInstruction(
        connection,
        tokenBonding.targetMint,
        params.purchaserWallet.publicKey,
        params.splTokenProgramId,
        params.splAssociatedTokenAccountProgramId
      )
    );
  }

  const [targetMintAuthority] = await PublicKey.findProgramAddress(
    [
      Buffer.from("target-authority", "utf-8"),
      tokenBonding.targetMint.toBuffer(),
    ],
    params.splTokenBondingProgramId
  );

  instructions.push(
    buyV0Instruction(
      params.splTokenBondingProgramId,
      params.splTokenProgramId,
      creator.tokenBonding,
      tokenBonding.curve,
      wumboInstance.wumboMint,
      tokenBonding.targetMint,
      targetMintAuthority,
      tokenBonding.founderRewards,
      tokenBonding.baseStorage,
      purchaseAccount,
      params.purchaserWallet.publicKey,
      destinationAccount,
      params.amount
    )
  );

  await sendTransaction(connection, instructions, params.purchaserWallet);

  console.log(
    `Bought ${params.amount} creator coins from ${purchaseAccount} to ${destinationAccount}`
  );
}

export async function sellCreatorCoinsWithWallet(
  connection: Connection,
  params: SellCreatorCoinsWithWalletParams
): Promise<void> {
  if (!params.sellerWallet.publicKey) {
    throw new Error("Invalid seller wallet");
  }

  const creator = await WumboCreator.retrieve(connection, params.wumboCreator);
  if (!creator) {
    throw new Error("Creator not found");
  }
  if (params.amount < 0) {
    throw new Error("Amount must be positive");
  }

  const tokenBonding = await TokenBondingV0.retrieve(
    connection,
    creator.tokenBonding
  );

  if (!tokenBonding) {
    throw new Error(`No token bonding at ${creator.tokenBonding}`);
  }

  const instructions = [];

  const wumboInstance = await WumboInstance.retrieve(
    connection,
    creator.wumboInstance
  );
  const sellAccount = await findAssociatedTokenAddress(
    params.sellerWallet.publicKey,
    tokenBonding.targetMint,
    params.splTokenProgramId,
    params.splAssociatedTokenAccountProgramId
  );
  const destinationAccount = await findAssociatedTokenAddress(
    params.sellerWallet.publicKey,
    wumboInstance.wumboMint,
    params.splTokenProgramId,
    params.splAssociatedTokenAccountProgramId
  );
  const acctExists = await connection.getAccountInfo(destinationAccount);
  if (!acctExists) {
    instructions.push(
      await createAssociatedTokenAccountInstruction(
        connection,
        wumboInstance.wumboMint,
        params.sellerWallet.publicKey,
        params.splTokenProgramId,
        params.splAssociatedTokenAccountProgramId
      )
    );
  }

  const [baseStorageAuthority, _] = await PublicKey.findProgramAddress(
    [
      Buffer.from("base-storage-authority", "utf-8"),
      tokenBonding.baseStorage.toBuffer(),
    ],
    params.splTokenBondingProgramId
  );

  const transaction = instructions.push(
    sellV0Instruction(
      params.splTokenBondingProgramId,
      params.splTokenProgramId,
      creator.tokenBonding,
      tokenBonding.curve,
      wumboInstance.wumboMint,
      tokenBonding.targetMint,
      tokenBonding.baseStorage,
      baseStorageAuthority,
      sellAccount,
      params.sellerWallet.publicKey,
      destinationAccount,
      params.amount
    )
  );

  await sendTransaction(connection, instructions, params.sellerWallet);

  console.log(
    `Burned ${params.amount} creator coins from ${sellAccount} to ${destinationAccount}`
  );
}
