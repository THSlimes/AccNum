import ArithmeticError from "../Arithmetic/ArithmeticError.js";
import type { Field } from "../Arithmetic/operators.js";
import type { Compare, PosNeg } from "../Arithmetic/relations.js";
import type { JSONValue } from "../serialization/JSONValue.js";
import ToJSON from "../serialization/JSONValue.js";
import { asSciInt } from "../parsing/number-parsing.js";
import { JSON_TYPE_KEY } from "../SharedConstants.js";
import NumberFormatError from "./NumberFormatError.js";
import type ToNumber from "../serialization/ToNumber.js";

function bigintGCD(a: bigint, b: bigint): bigint {
    while (b !== 0n) {
        const t = b;
        b = a % b;
        a = t;
    }


    return a;
}

function bigintAbs(a: bigint): bigint {
    if (a < 0n) a = -a;
    return a;
}


export type ToRatNum = RatNum | number | bigint | string;
export default class RatNum implements Field<ToRatNum, RatNum>, Compare<ToRatNum>, PosNeg, ToJSON, ToNumber {

    public static readonly NEG_ONE = new RatNum(-1n, 1n);
    public static readonly ZERO = new RatNum(0n, 1n);
    public static readonly ONE_TENTH = new RatNum(1n, 10n);
    public static readonly ONE_HALF = new RatNum(1n, 2n);
    public static readonly ONE = new RatNum(1n, 1n);
    public static readonly TWO = new RatNum(2n, 1n);
    public static readonly TEN = new RatNum(10n, 1n);



    // fraction is represented as a/b
    private readonly a: bigint;
    private readonly b: bigint;
    public get numerator() { return this.a; }
    public get denominator() { return this.b; }

    private constructor(num: bigint, denom: bigint) {
        if (denom === 0n) throw new ArithmeticError("division by 0");
        const isNeg = (num < 0) !== (denom < 0);
        num = bigintAbs(num);
        denom = bigintAbs(denom);

        const gcd = bigintAbs(bigintGCD(num, denom));
        if (isNeg) num = -num;

        this.a = num / gcd;
        this.b = denom / gcd;
    }


    public isInt(): boolean {
        return this.b === 1n;
    }

    public isPositive(): boolean {
        return this.numerator > 0n;
    }

    public isNegative(): boolean {
        return this.numerator < 0n;
    }

    public isZero(): boolean {
        return this.a === 0n;
    }


    /**
     * Gives a RatNum object that is equal to the absolute value of `this`.
     * @returns absolute of `this`
     */
    public abs(): RatNum {
        return this.isNegative() ? this.neg() : this;
    }


    public add(other: ToRatNum): RatNum {
        other = RatNum.from(other);
        return new RatNum(this.a * other.b + this.b * other.a, this.b * other.b);
    }

    public neg(): RatNum {
        return new RatNum(-this.a, this.b);
    }

    public sub(other: ToRatNum): RatNum {
        other = RatNum.from(other);
        return this.add(other.neg());
    }

    public mult(other: ToRatNum): RatNum {
        other = RatNum.from(other);
        return new RatNum(this.a * other.a, this.b * other.b);
    }

    public inv(): RatNum {
        return new RatNum(this.b, this.a);
    }

    public div(other: ToRatNum): RatNum {
        other = RatNum.from(other);
        return this.mult(other.inv());
    }


    public double(): RatNum {
        return new RatNum(this.numerator << 1n, this.denominator);
    }

    public half(): RatNum {
        return new RatNum(this.numerator, this.denominator << 1n);
    }


    public eq(other: ToRatNum): boolean {
        other = RatNum.from(other);
        return this.a === other.a
            && this.b === other.b;
    }

    public lt(other: ToRatNum): boolean {
        other = RatNum.from(other);
        return this.sub(other).isNegative();
    }

    public lte(other: ToRatNum): boolean {
        other = RatNum.from(other);
        return !this.sub(other).isPositive();
    }

    public gt(other: ToRatNum): boolean {
        return !this.lte(other);
    }

    public gte(other: ToRatNum): boolean {
        return !this.lt(other);
    }


    public toJSON(): JSONValue {
        return {
            [JSON_TYPE_KEY]: this.constructor.name,
            num: ToJSON.bigintToJSON(this.numerator),
            denom: ToJSON.bigintToJSON(this.denominator)
        };
    }

    public toNumber(): number {
        let num = this.a;
        let denom = this.b;

        while (!isFinite(Number(num)) && !isFinite(Number(num))) {
            num = num << 1n;
            denom = denom << 1n;
        }

        return Number(num) / Number(denom);
    }



    public static fromJSON(json: JSONValue): RatNum {
        if (typeof json !== "object" || json === null) throw TypeError("not an object");
        else if (!(JSON_TYPE_KEY in json)) throw new TypeError(`missing ${JSON_TYPE_KEY} key`);
        else if (json[JSON_TYPE_KEY] !== this.name) throw new TypeError(`not a serialized ${this.name}`);
        else if (!("num" in json)) throw new TypeError("missing num property");
        else if (!("denom" in json)) throw new TypeError("missing denom property");

        return new RatNum(ToJSON.bigintFromJSON(json.num), ToJSON.bigintFromJSON(json.denom));
    }

    public static from(v: ToRatNum): RatNum;
    public static from(v: number, w: number): RatNum;
    public static from(v: bigint, w: bigint): RatNum;
    public static from(v: ToRatNum, w?: number | bigint): RatNum {
        if (v instanceof RatNum) return v;
        else if (typeof v === "number") {
            if (typeof w === "number") return this.from(`${v} / ${w}`);
            else {
                const isNeg = v < 0;
                let str = Math.abs(v).toString(2);

                let [intPart, fracPart] = str.split('.');
                intPart ??= "";
                fracPart ??= "";

                str = intPart + fracPart;

                let num = 0n;
                for (let i = 0; i < str.length; i++) {
                    num = num << 1n;
                    if (str[i] === '1') num |= 1n;
                }

                let denom = 1n << BigInt(fracPart.length);

                return new RatNum(isNeg ? -num : num, denom);
            }
        }
        else if (typeof v === "bigint") {
            if (typeof w === "bigint") return new RatNum(v, w);
            else return new RatNum(v, 1n);
        }
        else if (typeof v === "string") {
            const parts = v.split('/').map(p => p.trim());
            if (parts.length > 2) throw new NumberFormatError(`unsupported RatNum format: "${v}"`);

            const aPart = parts[0];
            if (!aPart) throw new NumberFormatError(`unsupported RatNum format: "${v}"`);
            const a = asSciInt(aPart);

            const bPart = parts[1] ?? '1';
            if (!bPart) throw new NumberFormatError(`unsupported RatNum format: "${v}"`);
            const b = asSciInt(bPart);

            // output = (a.n * 10^a.exp) / (b.n * 10^b.exp)
            // = a.n/b.n * (10^a.exp / 10^b.exp)
            // = a.n/b.n * 10^(a.exp - b.exp)
            // = if (a.exp > b.exp) then (a.n*10^(a.exp-b.exp) / b.n) else (a.n / b.n*10^(b.exp-a.exp))

            if (a.exp > b.exp) return new RatNum(a.n * 10n ** (a.exp - b.exp), b.n);
            else return new RatNum(a.n, b.n * 10n ** (b.exp - a.exp));
        }

        throw TypeError("unsupported argument types");
    }

}