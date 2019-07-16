import {ParameterDeclaration, PropertyDeclaration, PropertySignature} from "typescript";

export default function isOptional(node: PropertyDeclaration | ParameterDeclaration | PropertySignature): boolean {
    return node.questionToken != null || node.initializer != null;
}
