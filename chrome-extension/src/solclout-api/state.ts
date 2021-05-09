import {Connection, PublicKey} from "@solana/web3.js";
import {deserializeUnchecked, Schema} from "@bonfida/borsh-js";
import {Numberu16, Numberu8} from "./utils";

export class SolcloutCreator {
  creatorToken: PublicKey;
  solcloutInstance: PublicKey;
  founderRewardsAccount: PublicKey;
  name: PublicKey;
  founderRewardPercentage: number;
  initialized: boolean;
  authorityNonce: number;

  static schema: Schema = new Map([
    [
      SolcloutCreator,
      {
        kind: 'struct',
        fields: [
          ['creatorToken', [32]],
          ['solcloutInstance', [32]],
          ['founderRewardsAccount', [32]],
          ['name', [32]],
          ['founderRewardPercentage', [16]],
          ['initialized', [1]],
          ['authorityNonce', [8]],
        ],
      },
    ],
  ]);

  constructor(obj: {
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
    let nameAccount = await connection.getAccountInfo(
      solcloutCreator,
      'processed',
    );
    if (!nameAccount) {
      throw new Error('Invalid name account provided');
    }

    return deserializeUnchecked(
      this.schema,
      SolcloutCreator,
      nameAccount.data,
    );
  }

  static LEN = 32 * 4 + 2 + 1 + 1
}