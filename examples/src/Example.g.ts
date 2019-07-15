import { Tson, TsonIgnore, TsonProp, convertToString, deserializeThrowing, convertToBoolean, deserialize, assignOrThrow, assignIfNotNull, convertToDate } from 'tson-runtime';
const converterFn = (value: any): boolean => value === '1';
const overrideName = 'override_name';
/*
    *** DO NOT EDIT! ***
    Generated deserializable class from: Example.ts.
*/
@Tson
export class Example {
    public readonly readonlyString: string;
    public readonly readonlyBool: boolean;
    constructor(readonlyString: string, readonlyBool: boolean = false) {
        this.readonlyString = readonlyString;
        this.readonlyBool = readonlyBool;
    }
    @TsonIgnore
    public ignoredProperty: string = 'ignored property';
    @TsonProp('override_name')
    public overrideNameUsingLiteral: string;
    @TsonProp(overrideName)
    public overrideNameUsingIdentifier: string;
    @TsonProp({ name: overrideName, converter: converterFn })
    public overrideNameAndCustomConverter: boolean = true;
    @TsonProp((value: any) => value === true)
    public customBooleanConverter: boolean = true;
    public dateProperty: Date = new Date();
    public static fromJson(data_1: any): Example {
        const readonlyString_1: string = deserializeThrowing(data_1, "readonlyString", convertToString);
        const readonlyBool_1: boolean | undefined = deserialize(data_1, "readonlyBool", convertToBoolean);
        const instance_1: Example = new Example(readonlyString_1, readonlyBool_1);
        assignOrThrow(instance_1, "overrideNameUsingLiteral", data_1, 'override_name', convertToString);
        assignOrThrow(instance_1, "overrideNameUsingIdentifier", data_1, overrideName, convertToString);
        assignIfNotNull(instance_1, "overrideNameAndCustomConverter", data_1, overrideName, converterFn);
        assignIfNotNull(instance_1, "customBooleanConverter", data_1, "customBooleanConverter", (value: any) => value === true);
        assignIfNotNull(instance_1, "dateProperty", data_1, "dateProperty", convertToDate);
        return instance_1;
    }
}
