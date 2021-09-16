/// <reference types="node" />
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import { Schema } from "borsh";
import { u64 } from "@solana/spl-token";
export declare class TokenBondingV0 {
    publicKey: PublicKey;
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
    static LEN: number;
    static schema: Schema;
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
    });
    static fromAccount(key: PublicKey, account: AccountInfo<Buffer>): TokenBondingV0;
    static retrieve(connection: Connection, tokenBonding: PublicKey): Promise<TokenBondingV0 | null>;
}
export declare class LogCurveV0 {
    publicKey: PublicKey;
    g: number;
    c: number;
    isBaseRelative: boolean;
    initialized: boolean;
    static LEN: number;
    static schema: Schema;
    constructor(obj: {
        key: Uint8Array;
        g: Uint8Array;
        c: Uint8Array;
        initialized: Uint8Array;
    });
    static fromAccount(key: PublicKey, account: AccountInfo<Buffer>): LogCurveV0;
    static retrieve(connection: Connection, logCurve: PublicKey): Promise<LogCurveV0 | null>;
}
//# sourceMappingURL=state.d.ts.map