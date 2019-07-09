"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = require("typescript");
function hasTsonDecoratedClassDeclaration(sourceFile) {
    return sourceFile.statements
        .filter(typescript_1.isClassDeclaration)
        .filter(classDec => classDec.decorators)
        .some(classDec => {
        for (const { expression } of classDec.decorators) {
            if (typescript_1.isIdentifier(expression)) {
                if (expression.escapedText === 'Tson') {
                    return true;
                }
            }
        }
        return false;
    });
}
exports.default = hasTsonDecoratedClassDeclaration;
//# sourceMappingURL=hasTsonDecoratedClassDeclaration.js.map