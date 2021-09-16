import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";
export declare class CreateLogCurveV0Args {
    instruction: number;
    g: BN;
    c: BN;
    taylorIterations: number;
    isBaseRelative: boolean;
    constructor(args: {
        g: BN;
        c: BN;
        taylorIterations: number;
        isBaseRelative: boolean;
    });
}
export declare class InitializeTokenBondingV0Args {
    instruction: number;
    founderRewardPercentage: number;
    mintCap: BN | undefined;
    tokenBondingAuthority: PublicKey | undefined;
    constructor(args: {
        founderRewardPercentage: number;
        mintCap: BN | undefined;
        tokenBondingAuthority: PublicKey | undefined;
    });
}
export declare class BuyV0Args {
    instruction: number;
    amount: BN;
    maxPrice: BN;
    constructor(args: {
        amount: BN;
        maxPrice: BN;
    });
}
export declare class SellV0Args {
    instruction: number;
    amount: BN;
    minPrice: BN;
    constructor(args: {
        amount: BN;
        minPrice: BN;
    });
}
export declare const TOKEN_BONDING_INSTRUCTION_SCHEMA: Map<any, any>;
export declare function initializeTokenBondingV0Instruction(programId: PublicKey, tokenProgramId: PublicKey, payer: PublicKey, tokenBondingAccount: PublicKey, tokenBondingAuthority: PublicKey | null, curve: PublicKey, baseMint: PublicKey, targetMint: PublicKey, founderRewards: PublicKey, baseStorage: PublicKey, baseStorageAuthority: PublicKey, founderRewardsPercentage: number, mintCap?: number): TransactionInstruction;
export declare function buyV0Instruction(programId: PublicKey, tokenProgramId: PublicKey, tokenBonding: PublicKey, curve: PublicKey, baseMint: PublicKey, targetMint: PublicKey, targetMintAuthority: PublicKey, founderRewards: PublicKey, baseStorage: PublicKey, purchaseAccount: PublicKey, purchaseAuthority: PublicKey, destination: PublicKey, amount: number, maxPrice: number): TransactionInstruction;
export declare function sellV0Instruction(programId: PublicKey, tokenProgramId: PublicKey, tokenBonding: PublicKey, curve: PublicKey, baseMint: PublicKey, targetMint: PublicKey, baseStorage: PublicKey, baseStorageAuthority: PublicKey, sellAccount: PublicKey, sellAuthority: PublicKey, destination: PublicKey, amount: number, minPrice: number): TransactionInstruction;
//# sourceMappingURL=instruction.d.ts.map