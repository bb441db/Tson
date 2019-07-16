import {
    assignIfNotNull,
    assignOrThrow,
    convertToDate,
    convertToString,
    createArrayConverter,
    deserializeThrowing,
    Tson,
    TsonIgnore,
    TsonProp
} from 'tson-runtime';
import Model from "./Model.g";

const converterFn = (value: any): boolean => value === '1';
interface ExampleInterface {
    test: string;
}
/*
    *** DO NOT EDIT! ***
    Generated deserializable class from: Example.ts.
*/
@Tson
export class Example {
    public readonly readonlyString: string;
    constructor(readonlyString: string) {
        this.readonlyString = readonlyString;
    }
    @TsonIgnore
    public ignoredProperty: string = 'ignored property';
    @TsonProp('override_name')
    public overridePropertyName: string;
    @TsonProp(converterFn)
    public customConverter: boolean;
    public dateProperty: Date = new Date();
    public arrayTest: string[] = [];
    public modelTest?: Model;
    public interfaceProp?: ExampleInterface;
    public static fromJson(data_1: any): Example {
        const readonlyString_1: string = deserializeThrowing(data_1, "readonlyString", convertToString);
        const instance_1: Example = new Example(readonlyString_1);
        assignOrThrow(instance_1, "overridePropertyName", data_1, 'override_name', convertToString);
        assignOrThrow(instance_1, "customConverter", data_1, "customConverter", converterFn);
        assignIfNotNull(instance_1, "dateProperty", data_1, "dateProperty", convertToDate);
        assignIfNotNull(instance_1, "arrayTest", data_1, "arrayTest", createArrayConverter(convertToString));
        assignIfNotNull(instance_1, "modelTest", data_1, "modelTest", Model.fromJson);
        assignIfNotNull(instance_1, "interfaceProp", data_1, "interfaceProp", (data_2: any): ExampleInterface => {
            const instance_2 = { test: deserializeThrowing(data_2, "test", convertToString) };
            return instance_2;
        });
        return instance_1;
    }
}
