"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellV0Instruction = exports.buyV0Instruction = exports.initializeTokenBondingV0Instruction = exports.TOKEN_BONDING_INSTRUCTION_SCHEMA = exports.SellV0Args = exports.BuyV0Args = exports.InitializeTokenBondingV0Args = exports.CreateLogCurveV0Args = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_name_service_1 = require("@bonfida/spl-name-service");
const borsh_1 = require("borsh");
class CreateLogCurveV0Args {
    constructor(args) {
        this.instruction = 0;
        this.g = args.g;
        this.c = args.c;
        this.taylorIterations = args.taylorIterations;
        this.isBaseRelative = args.isBaseRelative;
    }
}
exports.CreateLogCurveV0Args = CreateLogCurveV0Args;
class InitializeTokenBondingV0Args {
    constructor(args) {
        this.instruction = 1;
        this.founderRewardPercentage = args.founderRewardPercentage;
        this.mintCap = args.mintCap;
        this.tokenBondingAuthority = args.tokenBondingAuthority;
    }
}
exports.InitializeTokenBondingV0Args = InitializeTokenBondingV0Args;
class BuyV0Args {
    constructor(args) {
        this.instruction = 2;
        this.amount = args.amount;
        this.maxPrice = args.maxPrice;
    }
}
exports.BuyV0Args = BuyV0Args;
class SellV0Args {
    constructor(args) {
        this.instruction = 2;
        this.amount = args.amount;
        this.minPrice = args.minPrice;
    }
}
exports.SellV0Args = SellV0Args;
exports.TOKEN_BONDING_INSTRUCTION_SCHEMA = new Map([
    [
        CreateLogCurveV0Args,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['g', 'u128'],
                ['c', 'u128'],
                ['taylorIterations', 'u16'],
                ['isBaseRelative', 'u8'], // boolean
            ],
        },
    ],
    [
        InitializeTokenBondingV0Args,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['founderRewardPercentage', 'u16'],
                ['mintCap', { kind: 'option', type: 'u64' }],
                ['tokenBondingAuthority', { kind: 'option', type: 'pubkey' }],
            ],
        },
    ],
    [
        BuyV0Args,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['amount', 'u64'],
                ['maxPrice', 'u64'],
            ],
        },
    ],
    [
        SellV0Args,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['amount', 'u64'],
                ['minPrice', 'u64'],
            ],
        },
    ],
]);
function initializeTokenBondingV0Instruction(programId, tokenProgramId, payer, tokenBondingAccount, tokenBondingAuthority, curve, baseMint, targetMint, founderRewards, baseStorage, baseStorageAuthority, founderRewardsPercentage, mintCap) {
    return new web3_js_1.TransactionInstruction({
        programId,
        keys: [
            {
                pubkey: payer,
                isSigner: true,
                isWritable: true,
            },
            {
                pubkey: tokenBondingAccount,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: curve,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: baseMint,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: targetMint,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: founderRewards,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: baseStorage,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: baseStorageAuthority,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: tokenProgramId,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: web3_js_1.SystemProgram.programId,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: web3_js_1.SYSVAR_RENT_PUBKEY,
                isSigner: false,
                isWritable: false,
            },
        ],
        data: Buffer.from(borsh_1.serialize(exports.TOKEN_BONDING_INSTRUCTION_SCHEMA, new InitializeTokenBondingV0Args({
            founderRewardPercentage: founderRewardsPercentage,
            mintCap: mintCap ? new spl_name_service_1.Numberu64(mintCap) : undefined,
            tokenBondingAuthority: tokenBondingAuthority || undefined
        })))
    });
}
exports.initializeTokenBondingV0Instruction = initializeTokenBondingV0Instruction;
function buyV0Instruction(programId, tokenProgramId, tokenBonding, curve, baseMint, targetMint, targetMintAuthority, founderRewards, baseStorage, purchaseAccount, purchaseAuthority, destination, amount, maxPrice) {
    return new web3_js_1.TransactionInstruction({
        programId,
        keys: [
            {
                pubkey: tokenBonding,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: curve,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: baseMint,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: targetMint,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: targetMintAuthority,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: founderRewards,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: baseStorage,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: purchaseAccount,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: purchaseAuthority,
                isSigner: true,
                isWritable: false,
            },
            {
                pubkey: destination,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: tokenProgramId,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: web3_js_1.SystemProgram.programId,
                isSigner: false,
                isWritable: false,
            },
        ],
        data: Buffer.from(borsh_1.serialize(exports.TOKEN_BONDING_INSTRUCTION_SCHEMA, new BuyV0Args({
            amount: new spl_name_service_1.Numberu64(amount),
            maxPrice: new spl_name_service_1.Numberu64(maxPrice)
        })))
    });
}
exports.buyV0Instruction = buyV0Instruction;
function sellV0Instruction(programId, tokenProgramId, tokenBonding, curve, baseMint, targetMint, baseStorage, baseStorageAuthority, sellAccount, sellAuthority, destination, amount, minPrice) {
    return new web3_js_1.TransactionInstruction({
        programId,
        keys: [
            {
                pubkey: tokenBonding,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: curve,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: baseMint,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: targetMint,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: baseStorage,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: baseStorageAuthority,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: sellAccount,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: sellAuthority,
                isSigner: true,
                isWritable: false,
            },
            {
                pubkey: destination,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: tokenProgramId,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: web3_js_1.SystemProgram.programId,
                isSigner: false,
                isWritable: false,
            },
        ],
        data: Buffer.from(borsh_1.serialize(exports.TOKEN_BONDING_INSTRUCTION_SCHEMA, new SellV0Args({
            amount: new spl_name_service_1.Numberu64(amount),
            minPrice: new spl_name_service_1.Numberu64(minPrice)
        })))
    });
}
exports.sellV0Instruction = sellV0Instruction;
//# sourceMappingURL=instruction.js.map