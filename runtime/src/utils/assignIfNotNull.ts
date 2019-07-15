import Converter from "../types/Converter";

export default function assignIfNotNull<T, TKey extends keyof T, V extends T[TKey]>(
    instance: T,
    property: TKey,
    json: any,
    jsonKey: string,
    converter: Converter<V>
) {
    if (jsonKey in json) {
        instance[property] = converter(json[jsonKey]);
    }
}
