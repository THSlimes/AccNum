import { test, expect } from "vitest"
import { asSciInt } from "./number-parsing.js";

test("asSciInt correct output", () => {

    const res1 = asSciInt("123");
    expect(res1.n).toBe(123n);
    expect(res1.exp).toBe(0n);

    const res2 = asSciInt("-123");
    expect(res2.n).toBe(-123n);
    expect(res2.exp).toBe(0n);

    const res3 = asSciInt("+12.34");
    expect(res3.n).toBe(1234n);
    expect(res3.exp).toBe(-2n);

    const res4 = asSciInt("-.42");
    expect(res4.n).toBe(-42n);
    expect(res4.exp).toBe(-2n);

    const res5 = asSciInt("12E+34");
    expect(res5.n).toBe(12n);
    expect(res5.exp).toBe(34n);

    const res6 = asSciInt("-.12e34");
    expect(res6.n).toBe(-12n);
    expect(res6.exp).toBe(32n);

});