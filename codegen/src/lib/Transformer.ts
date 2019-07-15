import {
    getMutableClone,
    isClassDeclaration,
    Program,
    TransformationContext,
    Node, createNodeArray, visitEachChild, visitNode,
} from 'typescript';
import createJsonMethodForClass from "./createJsonMethodForClass";
export default function Transformer(program: Program) {
    return function transform<T extends Node>(context: TransformationContext) {
        return function (rootNode: T) {
            function visit(node: Node): Node {
                if (isClassDeclaration(node)) {
                    const classElement = createJsonMethodForClass(program, node);
                    const clone = getMutableClone(node);
                    clone.members = createNodeArray([...node.members, classElement]);
                    node = clone;
                }
                return visitEachChild(node, (child) => visit(child), context);
            }
            return visitNode(rootNode, visit);
        }
    }
};
