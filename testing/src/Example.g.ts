import { Model } from "./Model.g";
const converterFn = (value: any): boolean => value === '1';
const overrideName = 'override_name';
/*
    *** DO NOT EDIT! ***
    Generated deserializable class from: Example.ts.
*/
export class Example {
    public readonly readonlyString: string;
    public readonly readonlyBool: boolean;
    constructor(readonlyString: string, readonlyBool: boolean) {
        this.readonlyString = readonlyString;
        this.readonlyBool = readonlyBool;
    }
    public ignoredProperty: string = 'ignored property';
    public overrideNameUsingLiteral: string;
    public overrideNameUsingIdentifier: string;
    public overrideNameAndCustomConverter: boolean = true;
    public customBooleanConverter: boolean = true;
    public dateProperty: Date = new Date();
    public deserializableProperty: Model;
    public static fromJson(data_1: any): Example {
        const readonlyString_1: string = String(data_1["readonlyString"]);
        const readonlyBool_1: boolean = converterFn(data_1["readonlyBool"]);
        const instance_1: Example = new Example(readonlyString_1, readonlyBool_1);
        instance_1.overrideNameUsingLiteral = String(data_1['override_name']);
        instance_1.overrideNameUsingIdentifier = String(data_1[overrideName]);
        if (data_1["overrideNameAndCustomConverter"] != null)
            instance_1.overrideNameAndCustomConverter = converterFn(data_1[overrideName]);
        if (data_1["customBooleanConverter"] != null)
            instance_1.customBooleanConverter = ((value: any) => value === '1')(data_1["customBooleanConverter"]);
        if (data_1["dateProperty"] != null)
            instance_1.dateProperty = new Date(data_1["dateProperty"]);
        instance_1.deserializableProperty = Model.fromJson(data_1["deserializableProperty"]);
        return instance_1;
    }
}
