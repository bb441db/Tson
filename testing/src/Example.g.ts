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
    public static fromJson(json: any): Example {
        const readonlyProp: string = String(json["readonlyProp"]);
        const readonlyBool: boolean = Boolean(json["readonlyBool"]);
        const readonlyModel: Model | undefined = json["readonlyModel"] != null ? json["readonlyModel"] : undefined;
        const readonlyDate: Date = json["readonlyDate"] != null ? new Date(json["readonlyDate"]) : new Date();
        const deserialized: Example = new Example(readonlyProp, readonlyBool, readonlyModel, readonlyDate);
        deserialized.overrideName = String(json["override_name"]);
        if (json["customConverter"] != null)
            deserialized.customConverter = ((value: any) => value === 'yes')(json['override_name']);
        if (json["stringProperty"] != null)
            deserialized.stringProperty = String(json["stringProperty"]);
        if (json["numberProperty"] != null)
            deserialized.numberProperty = Number(json["numberProperty"]);
        if (json["booleanProperty"] != null)
            deserialized.booleanProperty = Boolean(json["booleanProperty"]);
        if (json["dateProperty"] != null)
            deserialized.dateProperty = new Date(json["dateProperty"]);
        deserialized.deserializableProperty = json["deserializableProperty"];
        return deserialized;
    }
}
