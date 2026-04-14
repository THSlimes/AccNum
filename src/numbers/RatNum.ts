import ArithmeticError from "../Arithmetic/ArithmeticError.js";
import type { Field } from "../Arithmetic/operators.js";
import type { Compare, PosNeg } from "../Arithmetic/relations.js";
import { asSciInt } from "../parsing/number-parsing.js";
import NumberFormatError from "./NumberFormatError.js";

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
export default class RatNum implements Field<ToRatNum, RatNum>, Compare<ToRatNum>, PosNeg {

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

    

    public static from(v: ToRatNum): RatNum;
    public static from(v: number, w: number): RatNum;
    public static from(v: bigint, w: bigint): RatNum;
    public static from(v: ToRatNum, w?: number | bigint): RatNum {
        if (v instanceof RatNum) return v;
        else if (typeof v === "number") {
            if (typeof w === "number") return this.from(`${v} / ${w}`);
            else return this.from(v.toString());
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