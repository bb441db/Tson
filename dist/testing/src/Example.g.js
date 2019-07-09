"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Model_g_1 = require("./Model.g");
/*
    *** DO NOT EDIT! ***
    Generated deserializable class from: Example.ts.
*/
class Example {
    constructor() {
        this.ignoredProperty = 'assign me in constructor';
        this.customConverter = true;
        this.stringProperty = 'default';
        this.numberProperty = 0;
        this.booleanProperty = true;
        this.dateProperty = new Date();
    }
    static fromJson(_json) {
        var _deserialized = new Example;
        _deserialized.overrideName = String(_json["override_name"]);
        if (_json["customConverter"] != null)
            _deserialized.customConverter = ((value) => value === 'yes')(_json['override_name']);
        if (_json["stringProperty"] != null)
            _deserialized.stringProperty = String(_json["stringProperty"]);
        if (_json["numberProperty"] != null)
            _deserialized.numberProperty = Number(_json["numberProperty"]);
        if (_json["booleanProperty"] != null)
            _deserialized.booleanProperty = Boolean(_json["booleanProperty"]);
        if (_json["dateProperty"] != null)
            _deserialized.dateProperty = new Date(_json["dateProperty"]);
        _deserialized.deserializableProperty = Model_g_1.Model.fromJson(_json["deserializableProperty"]);
        return _deserialized;
    }
}
exports.Example = Example;
//# sourceMappingURL=Example.g.js.map