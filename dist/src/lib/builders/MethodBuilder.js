"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = require("typescript");
const BlockBuilder_1 = require("./BlockBuilder");
class MethodBuilder {
    constructor() {
        this.modifiers = [];
        this.parameters = [];
        this.blockBuilder = new BlockBuilder_1.default();
    }
    addModifiers(...modifiers) {
        this.modifiers.push(...modifiers);
        return this;
    }
    addParameters(...parameters) {
        this.parameters.push(...parameters);
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
    updateBody(callback) {
        this.blockBuilder = callback(this.blockBuilder);
        return this;
    }
    addParameter(name, typeNode) {
        this.parameters.push(typescript_1.createParameter(undefined, undefined, undefined, name, undefined, typeNode));
        return this;
    }
    build() {
        return typescript_1.createMethod(undefined, this.modifiers, undefined, this.name, undefined, undefined, this.parameters, this.type, this.blockBuilder.build());
    }
}
exports.default = MethodBuilder;
//# sourceMappingURL=MethodBuilder.js.map