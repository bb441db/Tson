import Converter from "../types/Converter";

export default function assignOrThrow<T, TKey extends keyof T, V extends T[TKey]>(
    instance: T,
    property: TKey,
    json: any,
    jsonKey: string,
    converter: Converter<V>
) {
    if (jsonKey in json) {
        instance[property] = converter(json[jsonKey]);
    } else {
        throw new Error(`Property "${jsonKey}" is not defined`);
    }
}
