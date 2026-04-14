import { expect } from "vitest";
import type { Add, AddInv, Field, Mult, MultInv } from "../Arithmetic/operators.js";
import type { Eq } from "../Arithmetic/relations.js";
import type { Supplier } from "./suppliers.js";
import ArithmeticError from "../Arithmetic/ArithmeticError.js";

export function testAddAssociative<T extends Add<T, T> & Eq<T>>(gen: Supplier<T>, numTries = 100) {
    for (let i = 0; i < numTries; i++) {
        const a = gen();
        const b = gen();
        const c = gen();

        const way1 = a.add(b.add(c));
        const way2 = (a.add(b)).add(c);

        expect(way1.eq(way2)).toBeTruthy();
    }
}

export function testMultAssociative<T extends Mult<T, T> & Eq<T>>(gen: Supplier<T>, numTries = 100) {
    for (let i = 0; i < numTries; i++) {
        const a = gen();
        const b = gen();
        const c = gen();

        const lhs = a.mult(b.mult(c));
        const rhs = (a.mult(b)).mult(c);

        expect(lhs.eq(rhs)).toBeTruthy();
    }
}

export function testAddCommutative<T extends Add<T, T> & Eq<T>>(gen: Supplier<T>, numTries = 100) {
    for (let i = 0; i < numTries; i++) {
        const a = gen();
        const b = gen();

        const lhs = a.add(b);
        const rhs = b.add(a);

        expect(lhs.eq(rhs)).toBeTruthy();
    }
}

export function testMultCommutative<T extends Mult<T, T> & Eq<T>>(gen: Supplier<T>, numTries = 100) {
    for (let i = 0; i < numTries; i++) {
        const a = gen();
        const b = gen();

        const lhs = a.mult(b);
        const rhs = b.mult(a);

        expect(lhs.eq(rhs)).toBeTruthy();
    }
}

export function testAddIdentity<T extends Add<T, T> & Eq<T>>(id: T, gen: Supplier<T>, numTries = 100) {
    for (let i = 0; i < numTries; i++) {
        const a = gen();

        expect(a.add(id).eq(a)).toBeTruthy();
    }
}

export function testMultIdentity<T extends Mult<T, T> & Eq<T>>(id: T, gen: Supplier<T>, numTries = 100) {
    for (let i = 0; i < numTries; i++) {
        const a = gen();

        expect(a.mult(id).eq(a)).toBeTruthy();
    }
}

export function testAddInverse<T extends Add<T, T> & AddInv<T> & Eq<T>>(addIdentity: T, gen: Supplier<T>, numTries = 100) {
    for (let i = 0; i < numTries; i++) {
        const a = gen();

        expect(a.add(a.neg()).eq(addIdentity)).toBeTruthy();
    }
}

export function testMultInverse<T extends Mult<T, T> & MultInv<T> & Eq<T>>(multIdentity: T, gen: Supplier<T>, numTries = 100) {
    for (let i = 0; i < numTries; i++) {
        const a = gen();
        try {
            const aInv = a.inv();
            expect(a.mult(aInv).eq(multIdentity)).toBeTruthy();
        }
        catch (e) {
            if (e instanceof ArithmeticError) i--;
            else throw e;
        }

    }
}

export function testAddMultDistributivity<T extends Add<T, T> & Mult<T, T> & Eq<T>>(gen: Supplier<T>, numTries = 100) {
    for (let i = 0; i < numTries; i++) {
        const a = gen();
        const b = gen();
        const c = gen();

        const lhs = a.mult(b.add(c));
        const rhs = a.mult(b).add(a.mult(c));

        expect(lhs.eq(rhs)).toBeTruthy();
    }
}


export function testFieldProps<T extends Field<T, T> & Eq<T>>(addIdentity: T, multIdentity: T, gen: Supplier<T>, numTries = 100) {
    testAddAssociative(gen, numTries);
    testMultAssociative(gen, numTries);

    testAddCommutative(gen, numTries);
    testMultCommutative(gen, numTries);

    testAddIdentity(addIdentity, gen, numTries);
    testMultIdentity(multIdentity, gen, numTries);

    testAddInverse(addIdentity, gen, numTries);
    testMultInverse(multIdentity, gen, numTries);

    testAddMultDistributivity(gen, numTries);
}