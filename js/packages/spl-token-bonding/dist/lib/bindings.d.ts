import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
export declare const SOL_TOKEN: PublicKey;
export declare type BuyBondingParams = {
    splTokenBondingProgramId: PublicKey;
    splAssociatedTokenAccountProgramId: PublicKey;
    splTokenProgramId: PublicKey;
    tokenBonding: PublicKey;
    purchaser: PublicKey;
    amount: number;
    maxPrice: number;
};
export declare function buyBondingInstructions(connection: Connection, params: BuyBondingParams): Promise<TransactionInstruction[]>;
export declare type SellBondingParams = {
    splTokenBondingProgramId: PublicKey;
    splAssociatedTokenAccountProgramId: PublicKey;
    splTokenProgramId: PublicKey;
    tokenBonding: PublicKey;
    seller: PublicKey;
    amount: number;
    minPrice: number;
};
export declare function sellBondingInstructions(connection: Connection, params: SellBondingParams): Promise<TransactionInstruction[]>;
//# sourceMappingURL=bindings.d.ts.map