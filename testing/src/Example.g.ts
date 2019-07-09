// @ts-ignore
import { Tson, TsonIgnore, TsonProp } from 'tson';
import { Model } from "./Model.g";
/*
    *** DO NOT EDIT! ***
    Generated deserializable class from: Example.ts.
*/
export class Example {
    public ignoredProperty: string = 'assign me in constructor';
    public overrideName: string;
    public customConverter: boolean = true;
    public stringProperty: string = 'default';
    public numberProperty: number = 0;
    public booleanProperty: boolean = true;
    public dateProperty: Date = new Date();
    public deserializableProperty: Model;
    public static fromJson(_json: any): Example {
        var _deserialized: Example = new Example;
        _deserialized.overrideName = String(_json["override_name"]);
        if (_json["customConverter"] != null)
            _deserialized.customConverter = ((value: any) => value === 'yes')(_json['override_name']);
        if (_json["stringProperty"] != null)
            _deserialized.stringProperty = String(_json["stringProperty"]);
        if (_json["numberProperty"] != null)
            _deserialized.numberProperty = Number(_json["numberProperty"]);
        if (_json["booleanProperty"] != null)
            _deserialized.booleanProperty = Boolean(_json["booleanProperty"]);
        if (_json["dateProperty"] != null)
            _deserialized.dateProperty = new Date(_json["dateProperty"]);
        _deserialized.deserializableProperty = Model.fromJson(_json["deserializableProperty"]);
        return _deserialized;
    }
}
