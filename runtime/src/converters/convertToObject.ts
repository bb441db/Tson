import { tsonOptions } from "../options";

export default function convertToObject(value: any): object {
    const { convertToObject } = tsonOptions;
    if (typeof convertToObject === 'function') return convertToObject(value);
    if (typeof value === 'object') return value;
    return Object.create(value);
}
