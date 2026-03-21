export default class ArithmeticError extends Error {

    public constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
    }

}