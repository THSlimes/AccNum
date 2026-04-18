import { JSON_TYPE_KEY } from "./SharedConstants.js";

export type JSONValue = string | number | boolean | null | JSONValue[] | { [k: string]: JSONValue };

interface ToJSON {
    toJSON(): JSONValue;
}

namespace ToJSON {

    export function bigintToJSON(value: bigint): JSONValue {
        return { [JSON_TYPE_KEY]: "bigint", value: value.toString() };
    }

    export function bigintFromJSON(json:JSONValue): bigint {
        if (typeof json !== "object" || json === null) throw TypeError("not an object");
        else if (!(JSON_TYPE_KEY in json)) throw new TypeError(`missing ${JSON_TYPE_KEY} key`);
        else if (json[JSON_TYPE_KEY] !== "bigint") throw new TypeError("not a serialized bigint");
        else if (typeof json.value !== "string") throw new TypeError("value property must be a string");

        return BigInt(json.value);
    }

}

export default ToJSON;