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
exports.Wumbo = exports.SOL_TOKEN = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const instruction_1 = require("./instruction");
const state_1 = require("./state");
const spl_token_bonding_1 = require("@wum.bo/spl-token-bonding");
const spl_name_service_1 = require("@bonfida/spl-name-service");
exports.SOL_TOKEN = new web3_js_1.PublicKey("So11111111111111111111111111111111111111112");
class Wumbo {
    constructor(config) {
        this.getTwitterHandle = (connection, twitterHandle) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.getTwitterRegistry(connection, twitterHandle);
            }
            catch (_a) {
                return null;
            }
        });
        this.config = config;
    }
    getTwitterRegistry(connection, handle) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedTwitterHandle = yield spl_name_service_1.getHashedName(handle);
            const twitterHandleRegistryKey = yield spl_name_service_1.getNameAccountKey(hashedTwitterHandle, undefined, this.config.twitterTld);
            const registry = spl_name_service_1.NameRegistryState.retrieve(connection, twitterHandleRegistryKey);
            return registry;
        });
    }
    getTwitterUnclaimedTokenRefKey(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedName = yield spl_name_service_1.getHashedName(name);
            const twitterHandleRegistryKey = yield spl_name_service_1.getNameAccountKey(hashedName, undefined, this.config.twitterTld);
            const [key, _] = yield web3_js_1.PublicKey.findProgramAddress([
                Buffer.from("unclaimed-ref", "utf-8"),
                this.config.wumboInstanceId.toBuffer(),
                twitterHandleRegistryKey.toBuffer(),
            ], this.config.splWumboProgramId);
            return key;
        });
    }
    getTokenRefKeyFromOwner(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!owner) {
                return undefined;
            }
            return (yield web3_js_1.PublicKey.findProgramAddress([
                Buffer.from("claimed-ref", "utf-8"),
                this.config.wumboInstanceId.toBuffer(),
                owner.toBuffer(),
            ], this.config.splWumboProgramId))[0];
        });
    }
    getTokenRefKeyFromBonding(tokenBonding) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!tokenBonding) {
                return undefined;
            }
            return (yield web3_js_1.PublicKey.findProgramAddress([
                Buffer.from("reverse-token-ref", "utf-8"),
                this.config.wumboInstanceId.toBuffer(),
                tokenBonding.toBuffer(),
            ], this.config.splWumboProgramId))[0];
        });
    }
    getTwitterClaimedTokenRefKey(connection, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const header = yield this.getTwitterHandle(connection, name);
            if (header) {
                return this.getTokenRefKeyFromOwner(header.owner);
            }
        });
    }
    static createWumboSocialToken(connection, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!params.payer.publicKey) {
                throw new Error("Invalid payer");
            }
            const hashedName = yield spl_name_service_1.getHashedName(params.name);
            const nameKey = yield spl_name_service_1.getNameAccountKey(hashedName, params.nameClass, params.nameParent);
            const instructions = [];
            // Create creator coin
            const targetMint = new web3_js_1.Account();
            const [targetAuthority, targetNonce] = yield web3_js_1.PublicKey.findProgramAddress([
                Buffer.from("target-authority", "utf8"),
                targetMint.publicKey.toBuffer(),
            ], params.splTokenBondingProgramId);
            instructions.push(web3_js_1.SystemProgram.createAccount({
                fromPubkey: params.payer.publicKey,
                newAccountPubkey: targetMint.publicKey,
                lamports: yield spl_token_1.Token.getMinBalanceRentForExemptMint(connection),
                space: spl_token_1.MintLayout.span,
                programId: params.splTokenProgramId,
            }));
            instructions.push(spl_token_1.Token.createInitMintInstruction(params.splTokenProgramId, targetMint.publicKey, 9, targetAuthority, targetAuthority));
            console.log(`Added creator mint ${targetMint.publicKey}`);
            // Create founder rewards
            // If the person has already claimed their twitter handle, set the founder rewards account owner to
            // their wallet. Otherwise, set to the authority so wumbo can transfer the account to them later.
            let founderRewardsOwner, nameExists, tokenRef;
            try {
                const nameRegistryState = yield spl_name_service_1.NameRegistryState.retrieve(connection, nameKey);
                // Only the owner of the account can create a claimed coin
                if (nameRegistryState.owner.toBase58() !== params.payer.publicKey.toBase58()) {
                    throw new Error("Only the owner of this name can create a claimed coin");
                }
                founderRewardsOwner = nameRegistryState.owner;
                tokenRef = (yield web3_js_1.PublicKey.findProgramAddress([
                    Buffer.from("claimed-ref", "utf-8"),
                    params.wumboInstance.toBuffer(),
                    nameRegistryState.owner.toBuffer(),
                ], params.splWumboProgramId))[0];
                nameExists = true;
            }
            catch (e) {
                console.log("Creating an unclaimed coin, could not find name registry state", e);
                tokenRef = (yield web3_js_1.PublicKey.findProgramAddress([
                    Buffer.from("unclaimed-ref", "utf-8"),
                    params.wumboInstance.toBuffer(),
                    nameKey.toBuffer(),
                ], params.splWumboProgramId))[0];
                [founderRewardsOwner] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from("founder-rewards", "utf-8"), tokenRef.toBuffer()], params.splWumboProgramId);
                nameExists = false;
            }
            console.log(`Set founder rewards account owner to ${founderRewardsOwner}`);
            const associatedFounderRewardsAddress = yield spl_token_1.Token.getAssociatedTokenAddress(params.splAssociatedTokenAccountProgramId, params.splTokenProgramId, targetMint.publicKey, founderRewardsOwner, 
            // @ts-ignore
            true);
            instructions.push(spl_token_1.Token.createAssociatedTokenAccountInstruction(params.splAssociatedTokenAccountProgramId, params.splTokenProgramId, targetMint.publicKey, associatedFounderRewardsAddress, founderRewardsOwner, params.payer.publicKey));
            const [tokenBonding] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from("token-bonding", "utf-8"), targetMint.publicKey.toBuffer()], params.splTokenBondingProgramId);
            const [tokenBondingAuthority, _] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from("bonding-authority", "utf-8"), tokenRef.toBuffer()], params.splWumboProgramId);
            const wumboInstance = yield state_1.WumboInstance.retrieve(connection, params.wumboInstance);
            const reverseTokenRef = (yield web3_js_1.PublicKey.findProgramAddress([
                Buffer.from("reverse-token-ref", "utf-8"),
                params.wumboInstance.toBuffer(),
                tokenBonding.toBuffer(),
            ], params.splWumboProgramId))[0];
            // Setup base storage
            const [baseStorageKey] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from("base-storage-key", "utf8"), tokenBonding.toBuffer()], params.splTokenBondingProgramId);
            const [storageAuthority, storageNonce] = yield web3_js_1.PublicKey.findProgramAddress([
                Buffer.from("base-storage-authority", "utf8"),
                baseStorageKey.toBuffer(),
            ], params.splTokenBondingProgramId);
            instructions.push(spl_token_bonding_1.initializeTokenBondingV0Instruction(params.splTokenBondingProgramId, params.splTokenProgramId, params.payer.publicKey, tokenBonding, tokenBondingAuthority, wumboInstance.baseCurve, params.baseMint, targetMint.publicKey, associatedFounderRewardsAddress, baseStorageKey, storageAuthority, (params.founderRewardsPercentage / 100) * 10000));
            // Associate creator coin with name
            instructions.push(instruction_1.initializeCreatorInstruction(params.splWumboProgramId, params.payer.publicKey, tokenRef, reverseTokenRef, params.wumboInstance, nameKey, associatedFounderRewardsAddress, tokenBonding, nameExists ? founderRewardsOwner : undefined));
            yield sendTransaction(connection, instructions, params.payer, [targetMint]);
            console.log(`Created social token ref with key ${tokenRef}, founder rewards account ${associatedFounderRewardsAddress}, token bonding ${tokenBonding} and mint ${targetMint.publicKey}`);
            return {
                tokenRefKey: tokenRef,
                tokenBondingKey: tokenBonding,
                ownerKey: founderRewardsOwner,
            };
        });
    }
}
exports.Wumbo = Wumbo;
function sendTransaction(connection, instructions, wallet, extraSigners) {
    return __awaiter(this, void 0, void 0, function* () {
        const transaction = new web3_js_1.Transaction({
            feePayer: wallet.publicKey || undefined,
            recentBlockhash: (yield connection.getRecentBlockhash()).blockhash,
        });
        transaction.instructions = instructions;
        extraSigners && transaction.partialSign(...extraSigners);
        const signed = yield wallet.signTransaction(transaction);
        yield web3_js_1.sendAndConfirmRawTransaction(connection, signed.serialize());
    });
}
//# sourceMappingURL=bindings.js.map