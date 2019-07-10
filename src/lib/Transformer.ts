import * as ts from 'typescript';
import {
    createIdentifier,
    Decorator,
    getMutableClone, Identifier,
    ImportDeclaration, isCallExpression,
    isClassDeclaration,
    isDecorator, isIdentifier,
    isImportDeclaration,
    isNamedImports, isStringLiteral, isToken,
    Program,
    TransformationContext,
} from 'typescript';
import createJsonMethodForClass from "./createJsonMethodForClass";

const LIBRARY_NAME = 'tson';

export default function Transformer(program: Program) {

    function isTsonLibraryImportDeclaration(importDeclaration: ImportDeclaration) {
        return isStringLiteral(importDeclaration.moduleSpecifier) && importDeclaration.moduleSpecifier.text === LIBRARY_NAME
    }

    function updateImport(node: ImportDeclaration): ImportDeclaration | undefined {
        // Library only exports compile time decorators so we can safely remove this import declaration
        if (isTsonLibraryImportDeclaration(node)) {
            return undefined;
        }
        return node;
    }

    function importsIdentifier(node: ImportDeclaration, identifier: Identifier): boolean {
        if (isNamedImports(node.importClause.namedBindings)) {
            for (const element of node.importClause.namedBindings.elements) {
                if (element.name.text === identifier.text) {
                    return true;
                }
            }
        }
        return false;
    }

    function shouldRemoveDecorator(node: Decorator): boolean {
        const tsonImportDeclaration = node.getSourceFile()
            .statements
            .find(statement => isImportDeclaration(statement) && isTsonLibraryImportDeclaration(statement)) as ImportDeclaration;
        if (tsonImportDeclaration != null) {
            if (isCallExpression(node.expression) && isIdentifier(node.expression.expression)) {
                return importsIdentifier(tsonImportDeclaration, node.expression.expression);
            } else if (isIdentifier(node.expression)) {
                return importsIdentifier(tsonImportDeclaration, node.expression);
            }
        }
        return false;
    }

    return function transform<T extends ts.Node>(context: TransformationContext) {
        return function (rootNode: T) {
            function visit(node: ts.Node): ts.Node {
                if (isImportDeclaration(node)) {
                    return updateImport(node);
                }
                if (isDecorator(node) && shouldRemoveDecorator(node)) {
                    return undefined;
                }
                if (isClassDeclaration(node)) {
                    const classElement = createJsonMethodForClass(program, node);
                    const clone = getMutableClone(node);
                    clone.members = ts.createNodeArray([...node.members, classElement]);
                    node = clone;
                }
                return ts.visitEachChild(node, (child) => visit(child), context);
            }
            return ts.visitNode(rootNode, visit);
        }
    }
};
