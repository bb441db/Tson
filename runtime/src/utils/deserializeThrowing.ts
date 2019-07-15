import Converter from "../types/Converter";

export default function deserializeThrowing<T>(json: any, jsonKey: string, converter: Converter<T>): T {
    if (jsonKey in json) {
        return converter(json[jsonKey]);
    }
    throw new Error(`Property "${jsonKey}" is not defined`);
}
