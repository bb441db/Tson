"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = require("typescript");
class BlockBuilder {
    constructor() {
        this.statements = [];
        this.multiline = true;
    }
    addStatement(statement) {
        this.statements.push(statement);
        return this;
    }
    setMultiLine(bool) {
        this.multiline = bool;
        return this;
    }
    build() {
        return typescript_1.createBlock(this.statements, this.multiline);
    }
}
exports.default = BlockBuilder;
//# sourceMappingURL=BlockBuilder.js.map