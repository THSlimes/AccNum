export default class NumberFormatError extends Error {

    public constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
    }

}