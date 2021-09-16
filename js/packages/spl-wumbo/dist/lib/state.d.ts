/// <reference types="node" />
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import { Schema } from "borsh";
import { MintInfo } from "@solana/spl-token";
export declare class TokenRef {
    publicKey: PublicKey;
    wumboInstance: PublicKey;
    tokenBonding: PublicKey;
    owner?: PublicKey;
    name?: PublicKey;
    is_claimed: boolean;
    initialized: boolean;
    static LEN: number;
    static schema: Schema;
    constructor(obj: {
        key: number;
        wumboInstance: Uint8Array;
        tokenBonding: Uint8Array;
        ownerOrName: Uint8Array;
        initialized: Uint8Array;
    });
    static fromAccount(key: PublicKey, account: AccountInfo<Buffer>): TokenRef;
    static retrieve(connection: Connection, wumboCreator: PublicKey): Promise<TokenRef | null>;
}
export declare class Mint {
    static fromAccount(account: AccountInfo<Buffer>): MintInfo;
    static retrieve(connection: Connection, key: PublicKey): Promise<MintInfo | null>;
}
export declare class WumboInstance {
    wumboMint: PublicKey;
    baseCurve: PublicKey;
    nameProgramId: PublicKey;
    initialized: boolean;
    static schema: Schema;
    constructor(obj: {
        key: Uint8Array;
        wumboMint: Uint8Array;
        baseCurve: Uint8Array;
        nameProgramId: Uint8Array;
        initialized: Uint8Array;
    });
    static fromAccount(key: PublicKey, account: AccountInfo<Buffer>): WumboInstance;
    static retrieve(connection: Connection, wumboInstance: PublicKey): Promise<WumboInstance>;
    static LEN: number;
}
//# sourceMappingURL=state.d.ts.map