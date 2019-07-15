import { tsonOptions } from "../options";

export default function convertToBoolean(value: any): boolean {
    const { convertToBoolean } = tsonOptions;
    if (typeof convertToBoolean === 'function') return convertToBoolean(value);
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') return value === 'true';
    return false;
}
