import { tsonOptions } from "../options";

export default function convertToString(value: any): string {
    const { convertToString } = tsonOptions;
    if (typeof convertToString === 'function') return convertToString(value);
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
}
