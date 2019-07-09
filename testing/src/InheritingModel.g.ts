// @ts-ignore
import { Tson, TsonIgnore, TsonProp } from 'tson';
import { Model } from "./Model.g";
/*
    *** DO NOT EDIT! ***
    Generated deserializable class from: InheritingModel.ts.
*/
export class InheritingModel extends Model {
    public test: string = '';
    public override: string = '';
    public static fromJson(_json: any): InheritingModel {
        var _deserialized: InheritingModel = new InheritingModel;
        if (_json["test"] != null)
            _deserialized.test = String(_json["test"]);
        if (_json["override"] != null)
            _deserialized.override = String(_json["override"]);
        if (_json["ignored"] != null)
            _deserialized.ignored = _json["ignored"];
        if (_json["stringProperty"] != null)
            _deserialized.stringProperty = String(_json["stringProperty"]);
        if (_json["booleanProperty"] != null)
            _deserialized.booleanProperty = Boolean(_json["booleanProperty"]);
        if (_json["numberProperty"] != null)
            _deserialized.numberProperty = Number(_json["numberProperty"]);
        _deserialized.implicitAnyProperty = _json["implicitAnyProperty"];
        if (_json["dateProperty"] != null)
            _deserialized.dateProperty = new Date(_json["dateProperty"]);
        return _deserialized;
    }
}
