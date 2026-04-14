import { test, expect } from "vitest"
import RatNum from "./RatNum.js"

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