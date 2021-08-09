import {
  Account,
  Connection,
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { TokenBondingV0 } from "./state";
import { buyV0Instruction, sellV0Instruction } from "./instruction";
import { Token } from "@solana/spl-token";

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

export const SOL_TOKEN = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

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

export type BuyBondingWithWalletParams = {
  splTokenBondingProgramId: PublicKey;
  splAssociatedTokenAccountProgramId: PublicKey;
  splTokenProgramId: PublicKey;
  tokenBonding: PublicKey;
  wallet: WalletAdapter;
  amount: number;
  maxPrice: number;
};
export type BuyBondingParams = {
  splTokenBondingProgramId: PublicKey;
  splAssociatedTokenAccountProgramId: PublicKey;
  splTokenProgramId: PublicKey;
  tokenBonding: PublicKey;
  purchaser: PublicKey;
  amount: number;
  maxPrice: number;
};
export async function buyBondingInstructions(
  connection: Connection,
  params: BuyBondingParams
): Promise<TransactionInstruction[]> {
  if (params.amount < 0) {
    throw new Error("Amount must be positive");
  }

  const tokenBonding = await TokenBondingV0.retrieve(
    connection,
    params.tokenBonding
  );

  if (!tokenBonding) {
    throw new Error(`No token bonding at ${params.tokenBonding}`);
  }

  const instructions = [];
  const getAssociatedAccountOrCreate = async (mint: PublicKey) => {
    if (mint.toBase58() == SOL_TOKEN.toBase58()) {
      return params.purchaser;
    }

    const account = await findAssociatedTokenAddress(
      params.purchaser,
      mint,
      params.splTokenProgramId,
      params.splAssociatedTokenAccountProgramId
    );
    const acctExists = await connection.getAccountInfo(account);
    if (!acctExists) {
      console.log(`Creating account ${account.toBase58()}`);
      instructions.push(
        await createAssociatedTokenAccountInstruction(
          connection,
          mint,
          params.purchaser,
          params.splTokenProgramId,
          params.splAssociatedTokenAccountProgramId
        )
      );
    }

    return account;
  };

  const purchaseAccount = await getAssociatedAccountOrCreate(
    tokenBonding.baseMint
  );
  const destinationAccount = await getAssociatedAccountOrCreate(
    tokenBonding.targetMint
  );

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
      params.tokenBonding,
      tokenBonding.curve,
      tokenBonding.baseMint,
      tokenBonding.targetMint,
      targetMintAuthority,
      tokenBonding.founderRewards,
      tokenBonding.baseStorage,
      purchaseAccount,
      params.purchaser,
      destinationAccount,
      params.amount,
      params.maxPrice
    )
  );

  console.log(
    `Bought ${params.amount} coins from ${purchaseAccount} to ${destinationAccount}`
  );

  return instructions;
}

export async function buyBondingWithWallet(
  connection: Connection,
  params: BuyBondingWithWalletParams
): Promise<void> {
  if (!params.wallet.publicKey) {
    throw new Error("Invalid purchaser wallet");
  }

  const instructions = await buyBondingInstructions(connection, {
    ...params,
    purchaser: params.wallet.publicKey,
  });

  await sendTransaction(connection, instructions, params.wallet);
}

export type SellBondingParams = {
  splTokenBondingProgramId: PublicKey;
  splAssociatedTokenAccountProgramId: PublicKey;
  splTokenProgramId: PublicKey;
  tokenBonding: PublicKey;
  seller: PublicKey;
  amount: number;
  minPrice: number;
};

export async function sellBondingInstructions(
  connection: Connection,
  params: SellBondingParams
): Promise<TransactionInstruction[]> {
  if (params.amount < 0) {
    throw new Error("Amount must be positive");
  }

  const tokenBonding = await TokenBondingV0.retrieve(
    connection,
    params.tokenBonding
  );

  if (!tokenBonding) {
    throw new Error(`No token bonding at ${params.tokenBonding}`);
  }

  const instructions = [];
  const getAssociatedAccountOrCreate = async (mint: PublicKey) => {
    if (!params.seller) {
      throw new Error("Invalid purchaser wallet");
    }

    if (mint.toBase58() == SOL_TOKEN.toBase58()) {
      return params.seller;
    }

    const account = await findAssociatedTokenAddress(
      params.seller,
      mint,
      params.splTokenProgramId,
      params.splAssociatedTokenAccountProgramId
    );
    const acctExists = await connection.getAccountInfo(account);
    if (!acctExists) {
      console.log(`Creating account ${account.toBase58()}`);
      instructions.push(
        await createAssociatedTokenAccountInstruction(
          connection,
          mint,
          params.seller,
          params.splTokenProgramId,
          params.splAssociatedTokenAccountProgramId
        )
      );
    }

    return account;
  };

  const sellAccount = await getAssociatedAccountOrCreate(
    tokenBonding.targetMint
  );
  const destinationAccount = await getAssociatedAccountOrCreate(
    tokenBonding.baseMint
  );

  const [baseStorageAuthority, _] = await PublicKey.findProgramAddress(
    [
      Buffer.from("base-storage-authority", "utf-8"),
      tokenBonding.baseStorage.toBuffer(),
    ],
    params.splTokenBondingProgramId
  );

  instructions.push(
    sellV0Instruction(
      params.splTokenBondingProgramId,
      params.splTokenProgramId,
      params.tokenBonding,
      tokenBonding.curve,
      tokenBonding.baseMint,
      tokenBonding.targetMint,
      tokenBonding.baseStorage,
      baseStorageAuthority,
      sellAccount,
      params.seller,
      destinationAccount,
      params.amount,
      params.minPrice
    )
  );

  return instructions;
}

export type SellBondingWithWalletParams = {
  splTokenBondingProgramId: PublicKey;
  splAssociatedTokenAccountProgramId: PublicKey;
  splTokenProgramId: PublicKey;
  tokenBonding: PublicKey;
  wallet: WalletAdapter;
  amount: number;
  minPrice: number;
};
export async function sellBondingWithWallet(
  connection: Connection,
  params: SellBondingWithWalletParams
) {
  if (!params.wallet.publicKey) {
    throw new Error("Invalid seller wallet");
  }

  const instructions = await sellBondingInstructions(connection, {
    ...params,
    seller: params.wallet.publicKey,
  });

  await sendTransaction(connection, instructions, params.wallet);
}
