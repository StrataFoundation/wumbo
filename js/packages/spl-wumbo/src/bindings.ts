import {
  Account,
  Connection,
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { Token, MintLayout } from "@solana/spl-token";
import { initializeCreatorInstruction } from "./instruction";
import { WumboInstance } from "./state";
import { initializeTokenBondingV0Instruction } from "@wum.bo/spl-token-bonding";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import {
  getHashedName,
  getNameAccountKey,
  NameRegistryState,
} from "@bonfida/spl-name-service";

export const SOL_TOKEN = new PublicKey(
  "So11111111111111111111111111111111111111112"
);
interface IWumboConfig {
  splWumboProgramId: PublicKey;
  twitterTld: PublicKey;
  wumboInstanceId: PublicKey;
}

export interface CreateSocialTokenResult {
  tokenRefKey: PublicKey;
  tokenBondingKey: PublicKey;
  ownerKey: PublicKey;
}

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

export class Wumbo {
  config: IWumboConfig;

  constructor(config: IWumboConfig) {
    this.config = config;
  }

  async getTwitterRegistry(
    connection: Connection,
    handle: string
  ): Promise<NameRegistryState> {
    const hashedTwitterHandle = await getHashedName(handle);
    const twitterHandleRegistryKey = await getNameAccountKey(
      hashedTwitterHandle,
      undefined,
      this.config.twitterTld
    );
    const registry = NameRegistryState.retrieve(
      connection,
      twitterHandleRegistryKey
    );
    return registry;
  }

  getTwitterHandle = async (
    connection: Connection,
    twitterHandle: string
  ): Promise<NameRegistryState | null> => {
    try {
      return await this.getTwitterRegistry(connection, twitterHandle);
    } catch {
      return null;
    }
  };

  async getTwitterUnclaimedTokenRefKey(name: string): Promise<PublicKey> {
    const hashedName = await getHashedName(name);
    const twitterHandleRegistryKey = await getNameAccountKey(
      hashedName,
      undefined,
      this.config.twitterTld
    );
    const [key, _] = await PublicKey.findProgramAddress(
      [
        Buffer.from("unclaimed-ref", "utf-8"),
        this.config.wumboInstanceId.toBuffer(),
        twitterHandleRegistryKey.toBuffer(),
      ],
      this.config.splWumboProgramId
    );

    return key;
  }

  async getTokenRefKeyFromOwner(
    owner: PublicKey | undefined
  ): Promise<PublicKey | undefined> {
    if (!owner) {
      return undefined;
    }

    return (
      await PublicKey.findProgramAddress(
        [
          Buffer.from("claimed-ref", "utf-8"),
          this.config.wumboInstanceId.toBuffer(),
          owner.toBuffer(),
        ],
        this.config.splWumboProgramId
      )
    )[0];
  }

  async getTokenRefKeyFromBonding(
    tokenBonding: PublicKey | undefined
  ): Promise<PublicKey | undefined> {
    if (!tokenBonding) {
      return undefined;
    }

    return (
      await PublicKey.findProgramAddress(
        [
          Buffer.from("reverse-token-ref", "utf-8"),
          this.config.wumboInstanceId.toBuffer(),
          tokenBonding.toBuffer(),
        ],
        this.config.splWumboProgramId
      )
    )[0];
  }

  async getTwitterClaimedTokenRefKey(
    connection: Connection,
    name: string
  ): Promise<PublicKey | undefined> {
    const header = await this.getTwitterHandle(connection, name);
    if (header) {
      return this.getTokenRefKeyFromOwner(header.owner);
    }
  }

  static async createWumboSocialToken(
    connection: Connection,
    params: CreateWumboCreatorParams
  ): Promise<CreateSocialTokenResult> {
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
      [
        Buffer.from("target-authority", "utf8"),
        targetMint.publicKey.toBuffer(),
      ],
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

    // Create founder rewards
    // If the person has already claimed their twitter handle, set the founder rewards account owner to
    // their wallet. Otherwise, set to the authority so wumbo can transfer the account to them later.
    let founderRewardsOwner, nameExists, tokenRef;
    try {
      const nameRegistryState = await NameRegistryState.retrieve(
        connection,
        nameKey
      );
      // Only the owner of the account can create a claimed coin
      if (
        nameRegistryState.owner.toBase58() !== params.payer.publicKey.toBase58()
      ) {
        throw new Error(
          "Only the owner of this name can create a claimed coin"
        );
      }

      founderRewardsOwner = nameRegistryState.owner;
      tokenRef = (
        await PublicKey.findProgramAddress(
          [
            Buffer.from("claimed-ref", "utf-8"),
            params.wumboInstance.toBuffer(),
            nameRegistryState.owner.toBuffer(),
          ],
          params.splWumboProgramId
        )
      )[0];
      nameExists = true;
    } catch (e) {
      console.log(
        "Creating an unclaimed coin, could not find name registry state",
        e
      );
      tokenRef = (
        await PublicKey.findProgramAddress(
          [
            Buffer.from("unclaimed-ref", "utf-8"),
            params.wumboInstance.toBuffer(),
            nameKey.toBuffer(),
          ],
          params.splWumboProgramId
        )
      )[0];
      [founderRewardsOwner] = await PublicKey.findProgramAddress(
        [Buffer.from("founder-rewards", "utf-8"), tokenRef.toBuffer()],
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

    const [tokenBonding] = await PublicKey.findProgramAddress(
      [Buffer.from("token-bonding", "utf-8"), targetMint.publicKey.toBuffer()],
      params.splTokenBondingProgramId
    );
    const [tokenBondingAuthority, _] = await PublicKey.findProgramAddress(
      [Buffer.from("bonding-authority", "utf-8"), tokenRef.toBuffer()],
      params.splWumboProgramId
    );
    const wumboInstance = await WumboInstance.retrieve(
      connection,
      params.wumboInstance
    );
    const reverseTokenRef = (
      await PublicKey.findProgramAddress(
        [
          Buffer.from("reverse-token-ref", "utf-8"),
          params.wumboInstance.toBuffer(),
          tokenBonding.toBuffer(),
        ],
        params.splWumboProgramId
      )
    )[0];

    // Setup base storage
    const [baseStorageKey] = await PublicKey.findProgramAddress(
      [Buffer.from("base-storage-key", "utf8"), tokenBonding.toBuffer()],
      params.splTokenBondingProgramId
    );
    const [storageAuthority, storageNonce] = await PublicKey.findProgramAddress(
      [
        Buffer.from("base-storage-authority", "utf8"),
        baseStorageKey.toBuffer(),
      ],
      params.splTokenBondingProgramId
    );

    instructions.push(
      initializeTokenBondingV0Instruction(
        params.splTokenBondingProgramId,
        params.splTokenProgramId,
        params.payer.publicKey,
        tokenBonding,
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
        tokenRef,
        reverseTokenRef,
        params.wumboInstance,
        nameKey,
        associatedFounderRewardsAddress,
        tokenBonding,
        nameExists ? founderRewardsOwner : undefined
      )
    );

    await sendTransaction(connection, instructions, params.payer, [targetMint]);

    console.log(
      `Created social token ref with key ${tokenRef}, founder rewards account ${associatedFounderRewardsAddress}, token bonding ${tokenBonding} and mint ${targetMint.publicKey}`
    );

    return {
      tokenRefKey: tokenRef,
      tokenBondingKey: tokenBonding,
      ownerKey: founderRewardsOwner,
    };
  }
}

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
