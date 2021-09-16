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
exports.WumboInstance = exports.Mint = exports.TokenRef = void 0;
const web3_js_1 = require("@solana/web3.js");
const borsh_1 = require("borsh");
const spl_token_1 = require("@solana/spl-token");
class TokenRef {
    constructor(obj) {
        this.is_claimed = obj.key === 2;
        this.wumboInstance = new web3_js_1.PublicKey(obj.wumboInstance);
        this.tokenBonding = new web3_js_1.PublicKey(obj.tokenBonding);
        this.owner = this.is_claimed ? new web3_js_1.PublicKey(obj.ownerOrName) : undefined;
        this.name = this.is_claimed ? undefined : new web3_js_1.PublicKey(obj.ownerOrName);
        this.initialized = obj.initialized[0] === 1;
    }
    static fromAccount(key, account) {
        const value = borsh_1.deserializeUnchecked(TokenRef.schema, TokenRef, account.data);
        value.publicKey = key;
        return value;
    }
    static retrieve(connection, wumboCreator) {
        return __awaiter(this, void 0, void 0, function* () {
            let account = yield connection.getAccountInfo(wumboCreator);
            if (!account) {
                return account;
            }
            return this.fromAccount(wumboCreator, account);
        });
    }
}
exports.TokenRef = TokenRef;
TokenRef.LEN = 1 + 32 * 4 + 2 + 1 + 1;
TokenRef.schema = new Map([
    [
        TokenRef,
        {
            kind: "struct",
            fields: [
                ["key", 'u8'],
                ["wumboInstance", [32]],
                ["tokenBonding", [32]],
                ["ownerOrName", [32]],
                ["initialized", [1]],
            ],
        },
    ],
]);
class Mint {
    static fromAccount(account) {
        if (!account) {
            return account;
        }
        const data = Buffer.from(account.data);
        const mintInfo = spl_token_1.MintLayout.decode(data);
        if (mintInfo.mintAuthorityOption === 0) {
            mintInfo.mintAuthority = null;
        }
        else {
            mintInfo.mintAuthority = new web3_js_1.PublicKey(mintInfo.mintAuthority);
        }
        mintInfo.supply = spl_token_1.u64.fromBuffer(mintInfo.supply);
        return mintInfo;
    }
    static retrieve(connection, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield connection.getAccountInfo(key);
            if (!info) {
                return info;
            }
            if (info.data.length != spl_token_1.MintLayout.span) {
                throw new Error(`Invalid mint size`);
            }
            return this.fromAccount(info);
        });
    }
}
exports.Mint = Mint;
class WumboInstance {
    constructor(obj) {
        this.wumboMint = new web3_js_1.PublicKey(obj.wumboMint);
        this.baseCurve = new web3_js_1.PublicKey(obj.baseCurve);
        this.nameProgramId = new web3_js_1.PublicKey(obj.nameProgramId);
        this.initialized = obj.initialized[0] === 1;
    }
    static fromAccount(key, account) {
        const value = borsh_1.deserializeUnchecked(WumboInstance.schema, WumboInstance, account.data);
        value.publicKey = key;
        return value;
    }
    static retrieve(connection, wumboInstance) {
        return __awaiter(this, void 0, void 0, function* () {
            let account = yield connection.getAccountInfo(wumboInstance);
            if (!account) {
                throw new Error(`Invalid account provided ${wumboInstance.toString()}`);
            }
            return this.fromAccount(wumboInstance, account);
        });
    }
}
exports.WumboInstance = WumboInstance;
WumboInstance.schema = new Map([
    [
        WumboInstance,
        {
            kind: "struct",
            fields: [
                ["key", [1]],
                ["wumboMint", [32]],
                ["baseCurve", [32]],
                ["nameProgramId", [32]],
                ["initialized", [1]],
            ],
        },
    ],
]);
WumboInstance.LEN = 1 + 32 * 4 + 2 + 1;
//# sourceMappingURL=state.js.map