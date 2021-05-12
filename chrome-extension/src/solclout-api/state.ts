import {Connection, PublicKey} from "@solana/web3.js";
import {deserializeUnchecked, Schema} from "@bonfida/borsh-js";
import {Numberu16, Numberu8} from "./utils";
import {MintInfo, MintLayout, u64} from "@solana/spl-token";

export class SolcloutCreator {
  // @ts-ignore
  publicKey: PublicKey; // Gets set on retrieve
  creatorToken: PublicKey;
  solcloutInstance: PublicKey;
  founderRewardsAccount: PublicKey;
  name: PublicKey;
  founderRewardPercentage: number;
  initialized: boolean;
  authorityNonce: number;

  static LEN = 1 + 32 * 4 + 2 + 1 + 1

  static schema: Schema = new Map([
    [
      SolcloutCreator,
      {
        kind: 'struct',
        fields: [
          ['key', [1]],
          ['creatorToken', [32]],
          ['solcloutInstance', [32]],
          ['founderRewardsAccount', [32]],
          ['name', [32]],
          ['founderRewardPercentage', [2]],
          ['initialized', [1]],
          ['authorityNonce', [1]],
        ],
      },
    ],
  ]);

  constructor(obj: {
    key: Uint8Array;
    creatorToken: Uint8Array;
    solcloutInstance: Uint8Array;
    founderRewardsAccount: Uint8Array;
    name: Uint8Array;
    founderRewardPercentage: Uint8Array;
    initialized: Uint8Array;
    authorityNonce: Uint8Array
  }) {
    this.creatorToken = new PublicKey(obj.creatorToken);
    this.solcloutInstance = new PublicKey(obj.solcloutInstance);
    this.founderRewardsAccount = new PublicKey(obj.founderRewardsAccount);
    this.name = new PublicKey(obj.name);
    this.founderRewardPercentage = Numberu16.fromBuffer(Buffer.from(obj.founderRewardPercentage))
    this.authorityNonce = Numberu8.fromBuffer(Buffer.from(obj.authorityNonce))
    this.initialized = obj.initialized[0] === 1
  }

  static async retrieve(
    connection: Connection,
    solcloutCreator: PublicKey,
  ): Promise<SolcloutCreator> {
    let account = await connection.getAccountInfo(
      solcloutCreator,
      'processed',
    );
    if (!account) {
      throw new Error(`Invalid account provided ${solcloutCreator.toString()}`);
    }

    const value = deserializeUnchecked(
      this.schema,
      SolcloutCreator,
      account.data,
    );
    value.publicKey = solcloutCreator

    return value
  }

  mint?: MintInfo
  async getMint(connection: Connection): Promise<MintInfo> {
    if (this.mint) {
      return this.mint
    }

    const info = await connection.getAccountInfo(this.creatorToken);
    if (!info) {
      throw new Error("Invalid mint")
    }
    if (info.data.length != MintLayout.span) {
      throw new Error(`Invalid mint size`);
    }

    const data = Buffer.from(info.data);
    const mintInfo = MintLayout.decode(data);
    if (mintInfo.mintAuthorityOption === 0) {
      mintInfo.mintAuthority = null;
    } else {
      mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority);
    }

    mintInfo.supply = u64.fromBuffer(mintInfo.supply)

    this.mint = mintInfo

    return mintInfo
  }
}

export class SolcloutInstance {
  solcloutToken: PublicKey;
  solcloutStorage: PublicKey;
  tokenProgramId: PublicKey;
  nameProgramId: PublicKey;
  initialized: boolean;

  static schema: Schema = new Map([
    [
      SolcloutInstance,
      {
        kind: 'struct',
        fields: [
          ['key', [1]],
          ['solcloutToken', [32]],
          ['solcloutStorage', [32]],
          ['tokenProgramId', [32]],
          ['nameProgramId', [32]],
          ['initialized', [1]],
        ],
      },
    ],
  ]);

  constructor(obj: {
    key: Uint8Array;
    solcloutToken: Uint8Array;
    solcloutStorage: Uint8Array;
    tokenProgramId: Uint8Array;
    nameProgramId: Uint8Array;
    initialized: Uint8Array;
  }) {
    this.solcloutToken = new PublicKey(obj.solcloutToken);
    this.solcloutStorage = new PublicKey(obj.solcloutStorage);
    this.tokenProgramId = new PublicKey(obj.tokenProgramId);
    this.nameProgramId = new PublicKey(obj.nameProgramId);
    this.initialized = obj.initialized[0] === 1
  }

  static async retrieve(
    connection: Connection,
    solcloutInstance: PublicKey,
  ): Promise<SolcloutInstance> {
    let account = await connection.getAccountInfo(
      solcloutInstance,
      'processed',
    );
    if (!account) {
      throw new Error(`Invalid account provided ${solcloutInstance.toString()}`);
    }

    return deserializeUnchecked(
      this.schema,
      SolcloutInstance,
      account.data,
    );
  }

  static LEN = 1 + 32 * 4 + 2 + 1
}