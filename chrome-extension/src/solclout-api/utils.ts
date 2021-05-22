import BN from "bn.js";
import assert from "assert";

export class Numberu8 extends BN {
    /**
     * Convert to Buffer representation
     */
    toBuffer(): Buffer {
        const a = super.toArray().reverse();
        const b = Buffer.from(a);
        if (b.length === 1) {
            return b;
        }
        assert(b.length < 1, "Numberu8 too large");

        const zeroPad = Buffer.alloc(1);
        b.copy(zeroPad);
        return zeroPad;
    }

    /**
     * Construct a Numberu8 from Buffer representation
     */
    static fromBuffer(buffer: Buffer): any {
        assert(buffer.length === 1, `Invalid buffer length: ${buffer.length}`);
        return new BN(
            [...buffer]
                .reverse()
                .map((i) => `00${i.toString(16)}`.slice(-2))
                .join(""),
            16
        );
    }
}

export class Numberu16 extends BN {
    /**
     * Convert to Buffer representation
     */
    toBuffer(): Buffer {
        const a = super.toArray().reverse();
        const b = Buffer.from(a);
        if (b.length === 2) {
            return b;
        }
        assert(b.length < 2, "Numberu16 too large");

        const zeroPad = Buffer.alloc(2);
        b.copy(zeroPad);
        return zeroPad;
    }

    /**
     * Construct a Numberu8 from Buffer representation
     */
    static fromBuffer(buffer: Buffer): any {
        assert(buffer.length === 2, `Invalid buffer length: ${buffer.length}`);
        return new BN(
            [...buffer]
                .reverse()
                .map((i) => `00${i.toString(16)}`.slice(-2))
                .join(""),
            16
        );
    }
}