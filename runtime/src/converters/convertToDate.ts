import { tsonOptions } from "../options";

export default function convertToDate(value: any): Date {
    const { convertToDate } = tsonOptions;
    if (typeof convertToDate === 'function') return convertToDate(value);
    return new Date(value);
}
