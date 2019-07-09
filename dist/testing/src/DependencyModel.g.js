"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Model_g_1 = require("./Model.g");
/*
    *** DO NOT EDIT! ***
    Generated deserializable class from: DependencyModel.ts.
*/
class DependencyModel {
    static fromJson(_json) {
        var _deserialized = new DependencyModel;
        _deserialized.otherModelProperty = Model_g_1.Model.fromJson(_json["otherModelProperty"]);
        return _deserialized;
    }
}
exports.DependencyModel = DependencyModel;
//# sourceMappingURL=DependencyModel.g.js.map