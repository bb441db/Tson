import {
    createImportSpecifier,
    Identifier,
    ImportClause, ImportSpecifier,
    isIdentifier,
    isImportClause,
    isImportDeclaration, isNamedImports,
    isStringLiteral,
    isToken,
    Node, NodeArray, Statement, updateBindingElement, updateNamedImports
} from 'typescript';
import {MODULE_NAME} from "../constants";

export default function addImport(node: Node, identifier: Identifier): Identifier {
    function isTsonRuntimeModule(statement: Statement): boolean {
        return isImportDeclaration(statement)
            && isStringLiteral(statement.moduleSpecifier)
            && statement.moduleSpecifier.text === MODULE_NAME;
    }
    function containsIdentifier(elements: NodeArray<ImportSpecifier>, which: Identifier) {
        return elements.find(element => element.name.text === which.text) != null;
    }
    const sourceFile = node.getSourceFile();
    const importDeclaration = sourceFile.statements.find(isTsonRuntimeModule);
    if (importDeclaration && isImportDeclaration(importDeclaration) && isNamedImports(importDeclaration.importClause.namedBindings)) {
        const { namedBindings } = importDeclaration.importClause;
        const { elements } = namedBindings;
        if (!containsIdentifier(elements, identifier)) {
            const element = createImportSpecifier(undefined, identifier);
            importDeclaration.importClause.namedBindings = updateNamedImports(namedBindings, [...elements, element]);
        }
    }
    return identifier;
}
