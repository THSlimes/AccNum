import NumberFormatError from "../numbers/NumberFormatError.js";

const INT_REGEX = /^(-|\+)?[0-9]+$/;
const DECIMAL_REGEX = /^((?:-|\+)?[0-9]+)\.([0-9]+)$/;
const DECIMAL_ONLY_REGEX = /^(?:-|\+)?\.([0-9]+)$/;

/**
 * Represents the number input string as `n*10^m`.
 * @param s number input string
 */
export function asSciInt(s: string): { n: bigint, exp: bigint } {
    s = s.trim();

    let match = s.match(INT_REGEX);
    if (match) return { n: BigInt(s), exp: 0n };

    match = s.match(DECIMAL_REGEX);
    if (match) {
        const intPart = match[1]!;
        const fracPart = match[2]!;
        return { n: BigInt(intPart + fracPart), exp: BigInt(-fracPart.length) };
    }

    match = s.match(DECIMAL_ONLY_REGEX);
    if (match) {
        const sign = s[0] === '-' ? -1n : 1n;
        const fracPart = match[1]!;
        return { n: sign * BigInt(fracPart), exp: BigInt(-fracPart.length) };
    }

    const parts = s.split(/e|E/);
    if (parts.length === 2) {
        const numPart = parts[0]!;
        const exp = BigInt(parts[1]!);

        const numSci = asSciInt(numPart);
        numSci.exp += exp;
        return numSci;
    }

    throw new NumberFormatError(`unsupported number format: "${s}"`);
}