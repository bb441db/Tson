import Converter from "../types/Converter";

export default function deserialize<T>(json: any, jsonKey: string, converter: Converter<T>): T | undefined {
    if (jsonKey in json) {
        return converter(json[jsonKey]);
    }
    return undefined;
}
