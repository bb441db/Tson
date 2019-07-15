import {isClassDeclaration, isIdentifier, SourceFile} from "typescript";

export default function hasTsonDecoratedClassDeclaration(sourceFile: SourceFile): boolean {
    return sourceFile.statements
        .filter(isClassDeclaration)
        .filter(classDec => classDec.decorators)
        .some(classDec => {
            for (const { expression } of classDec.decorators) {
                if (isIdentifier(expression)) {
                    if (expression.escapedText === 'Tson') {
                        return true;
                    }
                }
            }
            return false;
        });
}
