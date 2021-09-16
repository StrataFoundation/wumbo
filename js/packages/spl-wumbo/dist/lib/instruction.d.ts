import { PublicKey, TransactionInstruction } from "@solana/web3.js";
export declare class InitializeWumboV0Args {
    instruction: number;
    nameProgramId: PublicKey;
    constructor(args: {
        nameProgramId: PublicKey;
    });
}
export declare class InitializeSocialTokenV0Args {
    instruction: number;
}
export declare const WUMBO_INSTRUCTION_SCHEMA: Map<any, any>;
export declare function initializeCreatorInstruction(programId: PublicKey, payer: PublicKey, tokenRef: PublicKey, reverseTokenRef: PublicKey, wumboInstance: PublicKey, name: PublicKey, founderRewardsAccount: PublicKey, tokenBonding: PublicKey, nameOwner?: PublicKey): TransactionInstruction;
//# sourceMappingURL=instruction.d.ts.map