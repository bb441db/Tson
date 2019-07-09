// @ts-ignore
import { Tson } from 'tson';
import { Model } from "./Model.g";
/*
    *** DO NOT EDIT! ***
    Generated deserializable class from: DependencyModel.ts.
*/
export class DependencyModel {
    public otherModelProperty: Model;
    public static fromJson(_json: any): DependencyModel {
        var _deserialized: DependencyModel = new DependencyModel;
        _deserialized.otherModelProperty = Model.fromJson(_json["otherModelProperty"]);
        return _deserialized;
    }
}
