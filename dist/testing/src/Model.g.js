"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
    *** DO NOT EDIT! ***
    Generated deserializable class from: Model.ts.
*/
class Model {
    constructor() {
        this.ignored = '';
        this.stringProperty = '';
        this.booleanProperty = true;
        this.numberProperty = 1;
        this.readOnlyProp = '';
        this.override = '';
    }
    static fromJson(_json) {
        var _deserialized = new Model;
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
            _deserialized.decoratedProp2 = ((value) => 'decoratedProp2 converter.')(_json["decoratedProp2"]);
        _deserialized.decoratedProp3 = ((value) => 'decoratedProp3 converter.')(_json['decorated_prop_3']);
        _deserialized.decoratedProp4 = String(_json['decorated_prop_4']);
        _deserialized.decoratedProp5 = (((value) => 'decoratedProp5 converter.'))(_json["decoratedProp5"]);
        return _deserialized;
    }
}
Model.staticProp = '';
exports.Model = Model;
//# sourceMappingURL=Model.g.js.map