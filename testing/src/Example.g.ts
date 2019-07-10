// @ts-ignore
import { Tson, TsonIgnore, TsonProp } from 'tson';
import { Model } from "./Model.g";
/*
    *** DO NOT EDIT! ***
    Generated deserializable class from: Example.ts.
*/
export class Example {
    public readonly readonlyProp: string;
    public readonly readonlyBool: boolean;
    public readonly readonlyDate: Date;
    public readonly readonlyModel: Model;
    constructor(readonlyProp: string, readonlyBool: boolean, readonlyModel?: Model, readonlyDate: Date = new Date()) {
        this.readonlyProp = readonlyProp;
        this.readonlyBool = readonlyBool;
        this.readonlyDate = readonlyDate;
        this.readonlyModel = readonlyModel;
    }
    public ignoredProperty: string = 'assign me in constructor';
    public overrideName: string;
    public customConverter: boolean = true;
    public stringProperty: string = 'default';
    public numberProperty: number = 0;
    public booleanProperty: boolean = true;
    public dateProperty: Date = new Date();
    public deserializableProperty: Model;
    public static fromJson(data_1: any): Example {
        const readonlyProp_1: string = String(data_1["readonlyProp"]);
        const readonlyBool_1: boolean = Boolean(data_1["readonlyBool"]);
        const readonlyModel_1: Model | undefined = data_1["readonlyModel"] != null ? Model.fromJson(data_1["readonlyModel"]) : undefined;
        const readonlyDate_1: Date = data_1["readonlyDate"] != null ? new Date(data_1["readonlyDate"]) : new Date();
        const instance_1: Example = new Example(readonlyProp_1, readonlyBool_1, readonlyModel_1, readonlyDate_1);
        instance_1.overrideName = String(data_1["override_name"]);
        if (data_1["customConverter"] != null)
            instance_1.customConverter = ((value: any) => value === 'yes')(data_1['override_name']);
        if (data_1["stringProperty"] != null)
            instance_1.stringProperty = String(data_1["stringProperty"]);
        if (data_1["numberProperty"] != null)
            instance_1.numberProperty = Number(data_1["numberProperty"]);
        if (data_1["booleanProperty"] != null)
            instance_1.booleanProperty = Boolean(data_1["booleanProperty"]);
        if (data_1["dateProperty"] != null)
            instance_1.dateProperty = new Date(data_1["dateProperty"]);
        instance_1.deserializableProperty = Model.fromJson(data_1["deserializableProperty"]);
        return instance_1;
    }
}
