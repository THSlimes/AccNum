import { test, expect } from "vitest"
import RatNum from "./RatNum.js";
import AccNum from "./AccNum.js";
import { getRandomAccNum } from "../test-util/suppliers.js";
import { testFieldProps } from "../test-util/number-properties.js";

const ACC_NUM_SUPPLIER = getRandomAccNum();

test("1 <= frac < 2", () => {
    for (let i = 0; i < 100; i++) {
        const num = ACC_NUM_SUPPLIER();

        if (!num.isZero()) {
            expect(num.frac.gte(RatNum.ONE)).toBeTruthy();
            expect(num.frac.lt(RatNum.TWO)).toBeTruthy();
        }
        else i--; // try again
    }
});

test("frac and exp correct", () => {
    const half = AccNum.from(RatNum.ONE_HALF);
    expect(half.frac.eq(RatNum.ONE)).toBeTruthy();
    expect(half.exp).toBe(-1n);
});


test("field properties", () => {
    testFieldProps(AccNum.ZERO, AccNum.ONE, ACC_NUM_SUPPLIER);
});


test("(de)serialization", () => {

    for (let i = 0; i < 1000; i ++) {
        const n = ACC_NUM_SUPPLIER();
        const remade = AccNum.fromJSON(n.toJSON());

        expect(remade.eq(n)).toBeTruthy();
    }

});