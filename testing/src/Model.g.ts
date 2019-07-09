// @ts-ignore
import { Tson, TsonIgnore, TsonProp } from 'tson';
/*
    *** DO NOT EDIT! ***
    Generated deserializable class from: Model.ts.
*/
export class Model {
    public ignored: any = '';
    public stringProperty: string = '';
    public booleanProperty: boolean = true;
    public numberProperty: number = 1;
    public implicitAnyProperty;
    public dateProperty?: Date;
    public static staticProp: string = '';
    public readonly readOnlyProp: string = '';
    public override: string = '';
    public decoratedProp1?: string;
    public decoratedProp2?: string;
    public decoratedProp3: string;
    public decoratedProp4: string;
    public decoratedProp5: string;
    public static fromJson(_json: any): Model {
        var _deserialized: Model = new Model;
        if (_json["stringProperty"] != null)
            _deserialized.stringProperty = String(_json["stringProperty"]);
        if (_json["booleanProperty"] != null)
            _deserialized.booleanProperty = Boolean(_json["booleanProperty"]);
        if (_json["numberProperty"] != null)
            _deserialized.numberProperty = Number(_json["numberProperty"]);
        _deserialized.implicitAnyProperty = _json["implicitAnyProperty"];
        if (_json["dateProperty"] != null)
            _deserialized.dateProperty = new Date(_json["dateProperty"]);
        if (_json["override"] != null)
            _deserialized.override = String(_json["override"]);
        if (_json["decoratedProp1"] != null)
            _deserialized.decoratedProp1 = String(_json["decorated_prop_1"]);
        if (_json["decoratedProp2"] != null)
            _deserialized.decoratedProp2 = ((value: any) => 'decoratedProp2 converter.')(_json["decoratedProp2"]);
        _deserialized.decoratedProp3 = ((value: any) => 'decoratedProp3 converter.')(_json['decorated_prop_3']);
        _deserialized.decoratedProp4 = String(_json['decorated_prop_4']);
        _deserialized.decoratedProp5 = (((value: any) => 'decoratedProp5 converter.'))(_json["decoratedProp5"]);
        return _deserialized;
    }
}
