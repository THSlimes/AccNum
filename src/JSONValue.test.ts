import { expect, test } from "vitest";
import { getRandomBigInt } from "./test-util/suppliers.js";
import ToJSON from "./JSONValue.js";

const BIGINT_SUPPLIER = getRandomBigInt(-1_000_000n, 1_000_000n);

test("bigint (de)serialization", () => {

    for (let i = 0; i < 1000; i ++) {
        const n = BIGINT_SUPPLIER();
        const remade = ToJSON.bigintFromJSON(ToJSON.bigintToJSON(n));

        expect(remade).toBe(n);
    }

});