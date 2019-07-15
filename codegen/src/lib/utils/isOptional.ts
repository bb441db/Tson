import {ParameterDeclaration, PropertyDeclaration} from "typescript";

export default function isOptional(node: PropertyDeclaration | ParameterDeclaration): boolean {
    return node.questionToken != null || node.initializer != null;
}
