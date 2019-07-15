import { tsonOptions } from "../options";

export default function convertToNumber(value: any): number {
    const { convertToNumber } = tsonOptions;
    if (typeof convertToNumber === 'function') return convertToNumber(value);
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return Number.parseInt(value);
    return NaN;
}
