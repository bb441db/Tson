"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Model_g_1 = require("./Model.g");
/*
    *** DO NOT EDIT! ***
    Generated deserializable class from: InheritingModel.ts.
*/
class InheritingModel extends Model_g_1.Model {
    constructor() {
        super(...arguments);
        this.test = '';
        this.override = '';
    }
    static fromJson(_json) {
        var _deserialized = new InheritingModel;
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
exports.InheritingModel = InheritingModel;
//# sourceMappingURL=InheritingModel.g.js.map