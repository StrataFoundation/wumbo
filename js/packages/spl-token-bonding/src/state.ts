import { Numberu16 } from "./utils";
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import { deserializeUnchecked, deserialize, Schema } from "borsh";
import { u64 } from "@solana/spl-token";

function decodeu128asf64(arg: Uint8Array): number {
  const x = new ArrayBuffer(16);
  const y = new DataView(x);
  arg.forEach((i: any, idx: number) => y.setUint8(idx, i));

  // 40 bits to represent the decimal
  const decimalWithPotentialExtra =
    (y.getUint32(0, true) + y.getUint8(4) * Math.pow(2, 32)) / Math.pow(10, 12);
  const decimal = decimalWithPotentialExtra % 1;
  const afterDecimal =
    decimalWithPotentialExtra -
    decimal +
    Number(y.getBigUint64(5)) * Math.pow(2, 40) +
    y.getUint16(8) * Math.pow(2, 104) +
    y.getUint8(10) * Math.pow(2, 120);

  return afterDecimal + decimal;
}

export class TokenBondingV0 {
  // @ts-ignore
  publicKey: PublicKey; // Gets set on retrieve
  baseMint: PublicKey;
  targetMint: PublicKey;
  authority: PublicKey | undefined;
  baseStorage: PublicKey;
  founderRewards: PublicKey;
  founderRewardPercentage: number;
  curve: PublicKey;
  mintCap: u64 | undefined;
  buyFrozen: boolean;
  sellFrozen: boolean;
  initialized: boolean;

  static LEN =
    1 + // key
    32 * 6 + // Public keys
    2 + // Options
    2 + // Founder rewards %
    8 + // Mint cap
    3; // buy frozen, sell frozen, initialized

  static schema: Schema = new Map([
    [
      TokenBondingV0,
      {
        kind: "struct",
        fields: [
          ["key", [1]],
          ["baseMint", [32]],
          ["targetMint", [32]],
          [
            "authority",
            {
              kind: "option",
              type: [32],
            },
          ],
          ["baseStorage", [32]],
          ["founderRewards", [32]],
          ["founderRewardPercentage", [2]],
          ["curve", [32]],
          [
            "mintCap",
            {
              kind: "option",
              type: [8],
            },
          ],
          ["buyFrozen", "u8"],
          ["sellFrozen", "u8"],
          ["initialized", "u8"],
        ],
      },
    ],
  ]);

  constructor(obj: {
    key: Uint8Array;
    baseMint: Uint8Array;
    targetMint: Uint8Array;
    authority: Uint8Array | undefined;
    baseStorage: Uint8Array;
    founderRewards: Uint8Array;
    founderRewardPercentage: Uint8Array;
    curve: Uint8Array;
    mintCap: Uint8Array | undefined;
    buyFrozen: boolean;
    sellFrozen: boolean;
    initialized: boolean;
  }) {
    this.baseMint = new PublicKey(obj.baseMint);
    this.targetMint = new PublicKey(obj.targetMint);
    this.authority = obj.authority && new PublicKey(obj.authority);
    this.baseStorage = new PublicKey(obj.baseStorage);
    this.founderRewards = new PublicKey(obj.founderRewards);
    this.founderRewardPercentage = new Numberu16(
      obj.founderRewardPercentage.reverse()
    ).toNumber();
    this.curve = new PublicKey(obj.curve);
    this.mintCap = obj.mintCap && u64.fromBuffer(Buffer.from(obj.mintCap));
    this.buyFrozen = obj.buyFrozen;
    this.sellFrozen = obj.sellFrozen;
    this.initialized = obj.initialized;
  }

  static fromAccount(
    key: PublicKey,
    account: AccountInfo<Buffer>
  ): TokenBondingV0 {
    const value = deserializeUnchecked(
      TokenBondingV0.schema,
      TokenBondingV0,
      account.data
    );
    value.publicKey = key;

    return value;
  }

  static async retrieve(
    connection: Connection,
    tokenBonding: PublicKey
  ): Promise<TokenBondingV0 | null> {
    let account = await connection.getAccountInfo(tokenBonding);

    if (!account) {
      return account;
    }

    return this.fromAccount(tokenBonding, account);
  }
}

export class LogCurveV0 {
  // @ts-ignore
  publicKey: PublicKey; // Gets set on retrieve
  g: number;
  c: number;
  isBaseRelative: boolean;
  initialized: boolean;

  static LEN = 1 + 16 * 2 + 2 + 1;

  static schema: Schema = new Map([
    [
      LogCurveV0,
      {
        kind: "struct",
        fields: [
          ["key", "u8"],
          ["g", [16]],
          ["c", [16]],
          ["taylor_iterations", [2]],
          ["initialized", "u8"],
        ],
      },
    ],
  ]);

  constructor(obj: {
    key: Uint8Array;
    g: Uint8Array;
    c: Uint8Array;
    initialized: Uint8Array;
  }) {
    this.isBaseRelative = obj.key[0] == 2;
    this.g = decodeu128asf64(obj.g);
    this.c = decodeu128asf64(obj.c);
    this.initialized = obj.initialized[0] === 1;
  }

  static fromAccount(key: PublicKey, account: AccountInfo<Buffer>): LogCurveV0 {
    const value = deserialize(LogCurveV0.schema, LogCurveV0, account.data);
    value.publicKey = key;

    return value;
  }

  static async retrieve(
    connection: Connection,
    logCurve: PublicKey
  ): Promise<LogCurveV0 | null> {
    let account = await connection.getAccountInfo(logCurve);

    if (!account) {
      return account;
    }

    return this.fromAccount(logCurve, account);
  }
}
