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
exports.LogCurveV0 = exports.TokenBondingV0 = void 0;
const utils_1 = require("./utils");
const web3_js_1 = require("@solana/web3.js");
const borsh_1 = require("borsh");
const spl_token_1 = require("@solana/spl-token");
function decodeu128asf64(arg) {
    const x = new ArrayBuffer(16);
    const y = new DataView(x);
    arg.forEach((i, idx) => y.setUint8(idx, i));
    // 40 bits to represent the decimal
    const decimalWithPotentialExtra = (y.getUint32(0, true) + y.getUint8(4) * Math.pow(2, 32)) / Math.pow(10, 12);
    const decimal = decimalWithPotentialExtra % 1;
    const afterDecimal = decimalWithPotentialExtra -
        decimal +
        Number(y.getBigUint64(5)) * Math.pow(2, 40) +
        y.getUint16(8) * Math.pow(2, 104) +
        y.getUint8(10) * Math.pow(2, 120);
    return afterDecimal + decimal;
}
class TokenBondingV0 {
    constructor(obj) {
        this.baseMint = new web3_js_1.PublicKey(obj.baseMint);
        this.targetMint = new web3_js_1.PublicKey(obj.targetMint);
        this.authority = obj.authority && new web3_js_1.PublicKey(obj.authority);
        this.baseStorage = new web3_js_1.PublicKey(obj.baseStorage);
        this.founderRewards = new web3_js_1.PublicKey(obj.founderRewards);
        this.founderRewardPercentage = new utils_1.Numberu16(obj.founderRewardPercentage.reverse()).toNumber();
        this.curve = new web3_js_1.PublicKey(obj.curve);
        this.mintCap = obj.mintCap && spl_token_1.u64.fromBuffer(Buffer.from(obj.mintCap));
        this.buyFrozen = obj.buyFrozen;
        this.sellFrozen = obj.sellFrozen;
        this.initialized = obj.initialized;
    }
    static fromAccount(key, account) {
        const value = borsh_1.deserializeUnchecked(TokenBondingV0.schema, TokenBondingV0, account.data);
        value.publicKey = key;
        return value;
    }
    static retrieve(connection, tokenBonding) {
        return __awaiter(this, void 0, void 0, function* () {
            let account = yield connection.getAccountInfo(tokenBonding);
            if (!account) {
                return account;
            }
            return this.fromAccount(tokenBonding, account);
        });
    }
}
exports.TokenBondingV0 = TokenBondingV0;
TokenBondingV0.LEN = 1 + // key
    32 * 6 + // Public keys
    2 + // Options
    2 + // Founder rewards %
    8 + // Mint cap
    3; // buy frozen, sell frozen, initialized
TokenBondingV0.schema = new Map([
    [
        TokenBondingV0,
        {
            kind: "struct",
            fields: [
                ["key", [1]],
                ["baseMint", [32]],
                ["targetMint", [32]],
                [
                    "authority",
                    {
                        kind: "option",
                        type: [32],
                    },
                ],
                ["baseStorage", [32]],
                ["founderRewards", [32]],
                ["founderRewardPercentage", [2]],
                ["curve", [32]],
                [
                    "mintCap",
                    {
                        kind: "option",
                        type: [8],
                    },
                ],
                ["buyFrozen", "u8"],
                ["sellFrozen", "u8"],
                ["initialized", "u8"],
            ],
        },
    ],
]);
class LogCurveV0 {
    constructor(obj) {
        this.isBaseRelative = obj.key[0] == 2;
        this.g = decodeu128asf64(obj.g);
        this.c = decodeu128asf64(obj.c);
        this.initialized = obj.initialized[0] === 1;
    }
    static fromAccount(key, account) {
        const value = borsh_1.deserialize(LogCurveV0.schema, LogCurveV0, account.data);
        value.publicKey = key;
        return value;
    }
    static retrieve(connection, logCurve) {
        return __awaiter(this, void 0, void 0, function* () {
            let account = yield connection.getAccountInfo(logCurve);
            if (!account) {
                return account;
            }
            return this.fromAccount(logCurve, account);
        });
    }
}
exports.LogCurveV0 = LogCurveV0;
LogCurveV0.LEN = 1 + 16 * 2 + 2 + 1;
LogCurveV0.schema = new Map([
    [
        LogCurveV0,
        {
            kind: "struct",
            fields: [
                ["key", "u8"],
                ["g", [16]],
                ["c", [16]],
                ["taylor_iterations", [2]],
                ["initialized", "u8"],
            ],
        },
    ],
]);
//# sourceMappingURL=state.js.map