import ArithmeticError from "../Arithmetic/ArithmeticError.js";
import type { Field } from "../Arithmetic/operators.js";
import type { Compare } from "../Arithmetic/relations.js";
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


type ToRatNum = RatNum | number | bigint | string;
export default class RatNum implements Field<ToRatNum>, Compare<ToRatNum> {

    public static readonly NEG_ONE = new RatNum(-1n, 1n);
    public static readonly ZERO = new RatNum(0n, 1n);
    public static readonly ONE = new RatNum(1n, 1n);
    public static readonly TWO = new RatNum(2n, 1n);
    public static readonly TEN = new RatNum(10n, 1n);



    // fraction is represented as a/b
    private readonly a: bigint;
    private readonly b: bigint;
    public get numerator() { return this.a; }
    public get denominator() { return this.b; }

    public constructor(num: bigint, denom: bigint) {
        if (denom === 0n) throw new ArithmeticError("division by 0");
        else if (denom < 0n) [num, denom] = [-num, -denom];

        const gcd = bigintAbs(bigintGCD(num, denom));

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



    public static from(v: ToRatNum): RatNum {
        if (v instanceof RatNum) return v;
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
        else return this.from(v.toString());
    }

}