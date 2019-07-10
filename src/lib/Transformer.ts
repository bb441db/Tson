import * as ts from 'typescript';
import {
    Decorator,
    getMutableClone,
    ImportDeclaration,
    isClassDeclaration,
    isDecorator,
    isImportDeclaration,
    isNamedImports,
    Program,
    TransformationContext,
} from 'typescript';
import createJsonMethodForClass from "./createJsonMethodForClass";

const decorators = [ 'Tson', 'TsonProp', 'TsonIgnore' ];

export default function Transformer(program: Program) {

    function updateImport(node: ImportDeclaration): ImportDeclaration | undefined {
        if (isNamedImports(node.importClause.namedBindings)) {
            /*if (node.importClause.namedBindings.elements.every(element => decorators.includes(element.propertyName.text))) {
                return undefined;
            }*/
        }
        return node;
    }

    function shouldRemoveDecorator(node: Decorator): boolean {
        return decorators.includes(node.expression['escapedText']) || shouldRemoveDecorator((node['expression'] as unknown) as Decorator);
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
