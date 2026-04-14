export interface Add<Other, Out> {

    /**
     * Gives a new object that is the sum of this and the given value.
     * @param other value to add
     * @returns new sum of `this` and `other` (`this + other`)
     */
    add(other: Other): Out;

}

export interface AddInv<Out> {

    /**
     * Gives a new object that is the additive inverse of this object.
     * @returns new additive inverse (`-this`)
     */
    neg(): Out;

}

export interface Sub<Other, Out> {

    /**
     * Gives a new object that is the difference between this and the given value.
     * @param other value to subtract
     * @returns new difference between `this` and `other` (`this - other`)
     */
    sub(other: Other): Out;

}

export interface Mult<Other, Out> {

    /**
     * Gives a new object that is the product of this and the given value.
     * @param other value to multiply by
     * @returns new product of `this` and `other` (`this * other`)
     */
    mult(other: Other): Out;

}

export interface MultInv<Out> {

    /**
     * Gives a new object that is the multiplicative inverse of this object.
     * @returns new multiplicative inverse (`this^-1`)
     */
    inv(): Out;

}

export interface Div<Other, Out> {

    /**
     * Gives a new object that is the quotient of this and the given value.
     * @param other value to divide by
     * @returns new quotient of `this` and `other` (`this / other`)
     */
    div(other: Other): Out;

}


export type Field<Other, Out> =
    Add<Other, Out> &
    AddInv<Other> &
    Sub<Other, Out> &
    Mult<Other, Out> &
    MultInv<Other> &
    Div<Other, Out>;