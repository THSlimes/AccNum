import type { Field } from "../Arithmetic/operators.js";
import type { Compare, PosNeg } from "../Arithmetic/relations.js";
import type { JSONValue } from "../serialization/JSONValue.js";
import ToJSON from "../serialization/JSONValue.js";
import type ToNumber from "../serialization/ToNumber.js";
import { JSON_TYPE_KEY } from "../SharedConstants.js";
import RatNum, { type ToRatNum } from "./RatNum.js";

type ToAccNum = AccNum | ToRatNum;
export default class AccNum implements Field<ToAccNum, AccNum>, Compare<ToAccNum>, PosNeg, ToJSON, ToNumber {

    public static readonly NEG_ONE = new AccNum(RatNum.NEG_ONE, 0n);
    public static readonly ZERO = new AccNum(RatNum.ZERO, 0n);
    public static readonly ONE_TENTH = new AccNum(RatNum.ONE_TENTH, 0n);
    public static readonly ONE_HALF = new AccNum(RatNum.ONE_HALF, 0n);
    public static readonly ONE = new AccNum(RatNum.ONE, 0n);
    public static readonly TWO = new AccNum(RatNum.TWO, 0n);
    public static readonly TEN = new AccNum(RatNum.TEN, 0n);



    public readonly frac: RatNum;
    public readonly exp: bigint;

    private constructor(frac: RatNum, exp: bigint) {
        if (frac.isZero()) {
            this.frac = frac;
            this.exp = 0n;
        }
        else {
            const isNeg = frac.isNegative();
            frac = frac.abs();

            while (frac.denominator > frac.numerator) { // ensure |frac| >= 1
                frac = frac.double(); // frac *= 2
                exp--; // 2^exp /= 2
            }

            while (frac.numerator >= 2n * frac.denominator) {
                frac = frac.half(); // frac /= 2
                exp++; // 2^exp *= 2
            }

            if (isNeg) frac = frac.neg();

            this.frac = frac;
            this.exp = exp;
        }
    }


    public isPositive(): boolean {
        return this.frac.isPositive();
    }

    public isNegative(): boolean {
        return this.frac.isNegative();
    }

    public isZero(): boolean {
        return this.frac.isZero();
    }


    /**
     * Gives an AccNum object that is equal to the absolute value of `this`.
     * @returns absolute of `this`
     */
    public abs(): AccNum {
        return this.isNegative() ? this.neg() : this;
    }


    public add(other: ToAccNum): AccNum {
        other = AccNum.from(other);

        if (other.exp >= this.exp) {
            // out = (this.frac + other.frac * 2^(other.exp-this.exp)) * 2^this.exp
            return new AccNum(this.frac.add(other.frac.mult(2n ** (other.exp - this.exp))), this.exp);
        }
        else return other.add(this);
    }

    public neg(): AccNum {
        return new AccNum(this.frac.neg(), this.exp);
    }

    public sub(other: ToAccNum): AccNum {
        other = AccNum.from(other);

        return this.add(other.neg());
    }

    public mult(other: ToAccNum): AccNum {
        other = AccNum.from(other);

        return new AccNum(this.frac.mult(other.frac), this.exp + other.exp);
    }

    public inv(): AccNum {
        return new AccNum(this.frac.inv(), -this.exp);
    }

    public div(other: ToAccNum): AccNum {
        other = AccNum.from(other);

        return this.mult(other.inv());
    }


    public double(): AccNum {
        return new AccNum(this.frac, this.exp + 1n);
    }

    public half(): AccNum {
        return new AccNum(this.frac, this.exp - 1n);
    }


    public eq(other: ToAccNum): boolean {
        other = AccNum.from(other);
        return this.frac.eq(other.frac) && this.exp === other.exp;
    }

    public lt(other: ToAccNum): boolean {
        other = AccNum.from(other);
        return this.sub(other).isNegative();
    }

    public lte(other: ToAccNum): boolean {
        other = AccNum.from(other);
        return !this.sub(other).isPositive();
    }

    public gt(other: ToAccNum): boolean {
        return !this.lte(other);
    }

    public gte(other: ToAccNum): boolean {
        return !this.lt(other);
    }


    public toJSON(): JSONValue {
        return {
            [JSON_TYPE_KEY]: this.constructor.name,
            frac: this.frac.toJSON(),
            exp: ToJSON.bigintToJSON(this.exp)
        };
    }

    public toNumber(): number {
        const fracNumber = this.frac.toNumber();
        const expNumber = Number(this.exp);

        if (expNumber === Infinity) return Infinity;
        else if (expNumber === -Infinity) return 0;
        else if (expNumber >= 0) return fracNumber * (1 << expNumber);
        else return fracNumber / (1 << -expNumber);
    }



    public static fromJSON(json: JSONValue): AccNum {
        if (typeof json !== "object" || json === null) throw TypeError("not an object");
        else if (!(JSON_TYPE_KEY in json)) throw new TypeError(`missing ${JSON_TYPE_KEY} key`);
        else if (json[JSON_TYPE_KEY] !== this.name) throw new TypeError(`not a serialized ${this.name}`);
        else if (!("frac" in json)) throw new TypeError("missing num property");
        else if (!("exp" in json)) throw new TypeError("missing denom property");

        return new AccNum(RatNum.fromJSON(json.frac), ToJSON.bigintFromJSON(json.exp));
    }

    public static from(v: ToAccNum): AccNum {
        if (v instanceof AccNum) return v;
        else return new AccNum(RatNum.from(v), 0n);
    }

}