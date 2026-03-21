export interface Eq<Other> {

    /**
     * Checks whether this objects is equal to the given object.
     * @param other `true` if the objects are equal, `false` otherwise
     */
    eq(other: Other): boolean;

}

export interface Lt<Other> {

    /**
     * Checks whether this objects is less than the given object.
     * @param other `true` if `this` is less than `other`, `false` otherwise
     */
    lt(other: Other): boolean;

}

export interface LtE<Other> {

    /**
     * Checks whether this objects is less than or equal to the given object.
     * @param other `true` if `this` is less than or equal to `other`, `false` otherwise
     */
    lte(other: Other): boolean;

}

export interface Gt<Other> {

    /**
     * Checks whether this objects is greater than the given object.
     * @param other `true` if `this` is greater than `other`, `false` otherwise
     */
    gt(other: Other): boolean;

}

export interface GtE<Other> {

    /**
     * Checks whether this objects is greater than or equal to the given object.
     * @param other `true` if `this` is greater than or equal to `other`, `false` otherwise
     */
    gte(other: Other): boolean;

}


export type Compare<Other> =
    Eq<Other> &
    Lt<Other> &
    LtE<Other> &
    Gt<Other> &
    GtE<Other>;