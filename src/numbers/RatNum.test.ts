import { test, expect } from "vitest"
import RatNum from "./RatNum.js"
import { testFieldProps } from "../test-util/number-properties.js";
import { getRandomNumber, getRandomRatNum } from "../test-util/suppliers.js";

test("denominator must not be negative", () => {
    const frac1 = RatNum.from(1n, -2n);
    expect(frac1.numerator).toBe(-1n);
    expect(frac1.denominator).toBe(2n);

    const frac2 = RatNum.from(-1n, 2n);
    expect(frac2.numerator).toBe(-1n);
    expect(frac2.denominator).toBe(2n);

    const frac3 = RatNum.from(1n, 2n);
    expect(frac3.numerator).toBe(1n);
    expect(frac3.denominator).toBe(2n);
});

test("simplify fractions", () => {
    const frac1 = RatNum.from(2n, 4n);
    expect(frac1.numerator).toBe(1n);
    expect(frac1.denominator).toBe(2n);

    const frac2 = RatNum.from(111n, 999n);
    expect(frac2.numerator).toBe(1n);
    expect(frac2.denominator).toBe(9n);

    const frac3 = RatNum.from(120n, 6n);
    expect(frac3.numerator).toBe(20n);
    expect(frac3.denominator).toBe(1n);
});

test("parsing to RatNum", () => {
    // from bigint
    const n1 = RatNum.from(42n);
    expect(n1.numerator).toBe(42n);
    expect(n1.denominator).toBe(1n);

    // from number
    const n2 = RatNum.from(1.125);
    expect(n2.numerator).toBe(9n);
    expect(n2.denominator).toBe(8n);


    // from string
    const n3 = RatNum.from("25e-2"); // exp notation, no denominator
    expect(n3.numerator).toBe(1n);
    expect(n3.denominator).toBe(4n);

    const n4 = RatNum.from("1 / 8");
    expect(n4.numerator).toBe(1n);
    expect(n4.denominator).toBe(8n);

    const n5 = RatNum.from(".1 / 10");
    expect(n5.numerator).toBe(1n);
    expect(n5.denominator).toBe(100n);
});

test("operations", () => {
    const half = RatNum.ONE_HALF;
    const quarter = RatNum.from(1n, 4n);

    const sum = half.add(quarter); // 1/2 + 1/4 = 3/4
    expect(sum.numerator).toBe(3n);
    expect(sum.denominator).toBe(4n);

    const diff = half.sub(quarter); // 1/2 - 1/4 = 1/4
    expect(diff.numerator).toBe(1n);
    expect(diff.denominator).toBe(4n);

    const prod = half.mult(quarter); // 1/2 * 1/4 = 1/8
    expect(prod.numerator).toBe(1n);
    expect(prod.denominator).toBe(8n);

    const quot = half.div(quarter); // 1/2 / 1/4 = 2/1
    expect(quot.numerator).toBe(2n);
    expect(quot.denominator).toBe(1n);
});

test("relations", () => {
    const half = RatNum.from(1n, 2n);
    const quarter = RatNum.from(1n, 4n);

    expect(half.eq(half)).toBeTruthy();
    expect(half.eq(quarter)).toBeFalsy();

    expect(half.lt(quarter)).toBeFalsy();
    expect(half.lte(quarter)).toBeFalsy();
    expect(half.gt(quarter)).toBeTruthy();
    expect(half.gte(quarter)).toBeTruthy();
});


const RAT_NUM_SUPPLIER = getRandomRatNum();
test("field properties", () => {
    testFieldProps(RatNum.ZERO, RatNum.ONE, RAT_NUM_SUPPLIER);
});


test("to/from JSON", () => {

    for (let i = 0; i < 1000; i++) {
        const n = RAT_NUM_SUPPLIER();
        const remade = RatNum.fromJSON(n.toJSON());

        expect(remade.eq(n)).toBeTruthy();
    }

});

const BIG_NUMBER_SUPPLIER = getRandomNumber(-1_000_000_000, 1_000_000_000);
const SMALL_NUMBER_SUPPLIER = getRandomNumber(-.01, .01);
const FLOAT_SPECIAL = [Infinity, -Infinity, NaN];
test("to/from number", () => {

    for (let i = 0; i < 1000; i++) {
        const n = BIG_NUMBER_SUPPLIER();
        const remade = RatNum.from(n).toNumber();

        expect(remade).toBe(n);
    }

    for (let i = 0; i < 1000; i++) {
        const n = SMALL_NUMBER_SUPPLIER();
        const remade = RatNum.from(n).toNumber();

        expect(remade).toBe(n);
    }

    // float special values
    for (const n of FLOAT_SPECIAL) {
        expect(() => RatNum.from(n)).toThrow();
    }

});