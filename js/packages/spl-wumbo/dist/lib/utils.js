"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Numberu16 = exports.Numberu8 = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const assert_1 = __importDefault(require("assert"));
class Numberu8 extends bn_js_1.default {
    /**
     * Convert to Buffer representation
     */
    toBuffer() {
        const a = super.toArray().reverse();
        const b = Buffer.from(a);
        if (b.length === 1) {
            return b;
        }
        assert_1.default(b.length < 1, "Numberu8 too large");
        const zeroPad = Buffer.alloc(1);
        b.copy(zeroPad);
        return zeroPad;
    }
    /**
     * Construct a Numberu8 from Buffer representation
     */
    static fromBuffer(buffer) {
        assert_1.default(buffer.length === 1, `Invalid buffer length: ${buffer.length}`);
        return new bn_js_1.default([...buffer]
            .reverse()
            .map((i) => `00${i.toString(16)}`.slice(-2))
            .join(""), 16);
    }
}
exports.Numberu8 = Numberu8;
class Numberu16 extends bn_js_1.default {
    /**
     * Convert to Buffer representation
     */
    toBuffer() {
        const a = super.toArray().reverse();
        const b = Buffer.from(a);
        if (b.length === 2) {
            return b;
        }
        assert_1.default(b.length < 2, "Numberu16 too large");
        const zeroPad = Buffer.alloc(2);
        b.copy(zeroPad);
        return zeroPad;
    }
    /**
     * Construct a Numberu8 from Buffer representation
     */
    static fromBuffer(buffer) {
        assert_1.default(buffer.length === 2, `Invalid buffer length: ${buffer.length}`);
        return new bn_js_1.default([...buffer]
            .reverse()
            .map((i) => `00${i.toString(16)}`.slice(-2))
            .join(""), 16);
    }
}
exports.Numberu16 = Numberu16;
//# sourceMappingURL=utils.js.map