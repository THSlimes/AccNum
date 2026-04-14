import AccNum from "../numbers/AccNum.js";
import RatNum from "../numbers/RatNum.js";

export type Supplier<T> = () => T;
export namespace Supplier {
    export function give<T>(val: T): Supplier<T> {
        return () => val;
    }

    export function transform<T, U>(input: Supplier<T>, funct: (v: T) => U): Supplier<U> {
        return () => funct(input());
    }

    export function pickFrom<T>(bag: Iterable<T>): Supplier<T> {
        const bagList = [...bag];
        if (bagList.length === 0) throw Error("cannot pick from empty gag");

        return () => bagList[Math.floor(Math.random() * bagList.length)]!;
    }



}


export function getRandomBigInt(lower: bigint, upper: bigint): Supplier<bigint> {
    return () => {
        if (lower > upper) [lower, upper] = [upper, lower];

        const range = upper - lower;

        let numBytes = 0;
        for (let r = range; r != 0n; r = r >> 8n) numBytes++;

        const arr = new Uint8Array(numBytes);
        crypto.getRandomValues(arr);

        let out = 0n;
        for (let i = 0; i < arr.length; i++) {
            out = (out << 8n) | BigInt(arr[i]!);
        }

        out %= range;
        return lower + out;
    };
}

const NUM_CHARS = "0123456789".split("");
const NUM_CHARS_PICKER = Supplier.pickFrom(NUM_CHARS);
export function getRandomRatNum(decay = .95): Supplier<RatNum> {
    if (decay < 0 || decay >= 1) throw RangeError(`decay must be greater or equal to 0 and less than 1`);

    return () => {
        let out = "";

        do { // generate random sequence of numbers
            out += NUM_CHARS_PICKER();
        } while (Math.random() <= decay);

        // randomly place decimal point
        const dotIndex = Math.floor(Math.random() * (out.length + 1));
        if (dotIndex != out.length) {
            out = out.substring(0, dotIndex) + '.' + out.substring(dotIndex);
        }



        return RatNum.from(out);
    };
}

export function getRandomAccNum(decay = .95): Supplier<AccNum> {
    return Supplier.transform(getRandomRatNum(decay), AccNum.from);
}