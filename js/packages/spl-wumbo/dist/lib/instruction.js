"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCreatorInstruction = exports.WUMBO_INSTRUCTION_SCHEMA = exports.InitializeSocialTokenV0Args = exports.InitializeWumboV0Args = void 0;
const web3_js_1 = require("@solana/web3.js");
const borsh_1 = require("borsh");
class InitializeWumboV0Args {
    constructor(args) {
        this.instruction = 0;
        this.nameProgramId = args.nameProgramId;
    }
}
exports.InitializeWumboV0Args = InitializeWumboV0Args;
class InitializeSocialTokenV0Args {
    constructor() {
        this.instruction = 1;
    }
}
exports.InitializeSocialTokenV0Args = InitializeSocialTokenV0Args;
exports.WUMBO_INSTRUCTION_SCHEMA = new Map([
    [
        InitializeWumboV0Args,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['nameProgramId', 'pubkey'],
            ],
        },
    ],
    [
        InitializeSocialTokenV0Args,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
            ],
        },
    ],
]);
function initializeCreatorInstruction(programId, payer, tokenRef, reverseTokenRef, wumboInstance, name, founderRewardsAccount, tokenBonding, nameOwner) {
    const keys = [
        {
            pubkey: payer,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: tokenRef,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: reverseTokenRef,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: wumboInstance,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: name,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: founderRewardsAccount,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: tokenBonding,
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
    ];
    if (nameOwner) {
        keys.push({
            pubkey: nameOwner,
            isSigner: true,
            isWritable: false,
        });
    }
    return new web3_js_1.TransactionInstruction({
        programId,
        keys,
        data: Buffer.from(borsh_1.serialize(exports.WUMBO_INSTRUCTION_SCHEMA, new InitializeSocialTokenV0Args()))
    });
}
exports.initializeCreatorInstruction = initializeCreatorInstruction;
//# sourceMappingURL=instruction.js.map