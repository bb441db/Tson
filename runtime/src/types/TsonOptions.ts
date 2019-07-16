import Converter from "./Converter";

interface TsonOptions {
    convertToBoolean: Converter<boolean>;
    convertToDate: Converter<Date>;
    convertToNumber: Converter<number>;
    convertToString: Converter<string>;
    convertToObject: Converter<object>;
    createArrayConverter: <T>(converter: Converter<T>) => Converter<T[]>;
}

export default TsonOptions;
