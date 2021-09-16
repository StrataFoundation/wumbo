"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellBondingInstructions = exports.buyBondingInstructions = exports.SOL_TOKEN = void 0;
const web3_js_1 = require("@solana/web3.js");
const state_1 = require("./state");
const instruction_1 = require("./instruction");
const spl_token_1 = require("@solana/spl-token");
exports.SOL_TOKEN = new web3_js_1.PublicKey("So11111111111111111111111111111111111111112");
function findAssociatedTokenAddress(walletAddress, tokenMintAddress, tokenProgramId, splAssociatedTokenAccountProgramId) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield web3_js_1.PublicKey.findProgramAddress([walletAddress.toBuffer(), tokenProgramId.toBuffer(), tokenMintAddress.toBuffer()], splAssociatedTokenAccountProgramId))[0];
    });
}
function createAssociatedTokenAccountInstruction(connection, mint, owner, tokenProgramId, associatedTokenProgramId) {
    return __awaiter(this, void 0, void 0, function* () {
        const associatedToken = yield spl_token_1.Token.getAssociatedTokenAddress(associatedTokenProgramId, tokenProgramId, mint, owner);
        return spl_token_1.Token.createAssociatedTokenAccountInstruction(associatedTokenProgramId, tokenProgramId, mint, associatedToken, owner, owner);
    });
}
function buyBondingInstructions(connection, params) {
    return __awaiter(this, void 0, void 0, function* () {
        if (params.amount < 0) {
            throw new Error("Amount must be positive");
        }
        const tokenBonding = yield state_1.TokenBondingV0.retrieve(connection, params.tokenBonding);
        if (!tokenBonding) {
            throw new Error(`No token bonding at ${params.tokenBonding}`);
        }
        const instructions = [];
        const getAssociatedAccountOrCreate = (mint) => __awaiter(this, void 0, void 0, function* () {
            if (mint.toBase58() == exports.SOL_TOKEN.toBase58()) {
                return params.purchaser;
            }
            const account = yield findAssociatedTokenAddress(params.purchaser, mint, params.splTokenProgramId, params.splAssociatedTokenAccountProgramId);
            const acctExists = yield connection.getAccountInfo(account);
            if (!acctExists) {
                console.log(`Creating account ${account.toBase58()}`);
                instructions.push(yield createAssociatedTokenAccountInstruction(connection, mint, params.purchaser, params.splTokenProgramId, params.splAssociatedTokenAccountProgramId));
            }
            return account;
        });
        const purchaseAccount = yield getAssociatedAccountOrCreate(tokenBonding.baseMint);
        const destinationAccount = yield getAssociatedAccountOrCreate(tokenBonding.targetMint);
        const [targetMintAuthority] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from("target-authority", "utf-8"), tokenBonding.targetMint.toBuffer()], params.splTokenBondingProgramId);
        instructions.push(instruction_1.buyV0Instruction(params.splTokenBondingProgramId, params.splTokenProgramId, params.tokenBonding, tokenBonding.curve, tokenBonding.baseMint, tokenBonding.targetMint, targetMintAuthority, tokenBonding.founderRewards, tokenBonding.baseStorage, purchaseAccount, params.purchaser, destinationAccount, params.amount, params.maxPrice));
        console.log(`Bought ${params.amount} coins from ${purchaseAccount} to ${destinationAccount}`);
        return instructions;
    });
}
exports.buyBondingInstructions = buyBondingInstructions;
function sellBondingInstructions(connection, params) {
    return __awaiter(this, void 0, void 0, function* () {
        if (params.amount < 0) {
            throw new Error("Amount must be positive");
        }
        const tokenBonding = yield state_1.TokenBondingV0.retrieve(connection, params.tokenBonding);
        if (!tokenBonding) {
            throw new Error(`No token bonding at ${params.tokenBonding}`);
        }
        const instructions = [];
        const getAssociatedAccountOrCreate = (mint) => __awaiter(this, void 0, void 0, function* () {
            if (!params.seller) {
                throw new Error("Invalid purchaser wallet");
            }
            if (mint.toBase58() == exports.SOL_TOKEN.toBase58()) {
                return params.seller;
            }
            const account = yield findAssociatedTokenAddress(params.seller, mint, params.splTokenProgramId, params.splAssociatedTokenAccountProgramId);
            const acctExists = yield connection.getAccountInfo(account);
            if (!acctExists) {
                console.log(`Creating account ${account.toBase58()}`);
                instructions.push(yield createAssociatedTokenAccountInstruction(connection, mint, params.seller, params.splTokenProgramId, params.splAssociatedTokenAccountProgramId));
            }
            return account;
        });
        const sellAccount = yield getAssociatedAccountOrCreate(tokenBonding.targetMint);
        const destinationAccount = yield getAssociatedAccountOrCreate(tokenBonding.baseMint);
        const [baseStorageAuthority, _] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from("base-storage-authority", "utf-8"), tokenBonding.baseStorage.toBuffer()], params.splTokenBondingProgramId);
        instructions.push(instruction_1.sellV0Instruction(params.splTokenBondingProgramId, params.splTokenProgramId, params.tokenBonding, tokenBonding.curve, tokenBonding.baseMint, tokenBonding.targetMint, tokenBonding.baseStorage, baseStorageAuthority, sellAccount, params.seller, destinationAccount, params.amount, params.minPrice));
        return instructions;
    });
}
exports.sellBondingInstructions = sellBondingInstructions;
//# sourceMappingURL=bindings.js.map