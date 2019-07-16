import Converter from "../types/Converter";
import { tsonOptions } from "../options";

export default function createArrayConverter<T>(converter: Converter<T>): Converter<T[]> {
    const { createArrayConverter } = tsonOptions;
    if (typeof createArrayConverter === 'function') return createArrayConverter(converter);
    return (value: any): T[] => {
        return Array.from(value).map(converter);
    }
}
