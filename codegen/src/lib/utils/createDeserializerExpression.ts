import {
    createCall, createElementAccess,
    createIdentifier,
    createKeywordTypeNode,
    createPropertyAccess,
    escapeLeadingUnderscores,
    Expression,
    Identifier,
    isMethodDeclaration,
    ParameterDeclaration,
    Program,
    PropertyDeclaration,
    SyntaxKind,
    Type,
    TypeNode
} from "typescript";
import getPropertyMetadata from "./getPropertyMetadata";
import {
    CONVERT_TO_BOOLEAN,
    CONVERT_TO_DATE,
    CONVERT_TO_NUMBER,
    CONVERT_TO_OBJECT,
    CONVERT_TO_STRING,
    DESERIALIZE,
    DESERIALIZE_THROWING,
    FROM_JSON_FN_NAME
} from "../constants";
import isOptional from "./isOptional";
import TsonError from "../errors/TsonError";
import getConverter from "./getConverter";
import addImport from "./addImport";

export default function createDeserializerExpression(
    program: Program,
    node: ParameterDeclaration | PropertyDeclaration,
    instance: Identifier,
    json: Identifier,
): Expression {
    const checker = program.getTypeChecker();
    const metadata = getPropertyMetadata(program, node);
    const converter = metadata.converter || getConverter(program, instance, node);
    const deserializeFunction = isOptional(node)
        ? addImport(node, createIdentifier(DESERIALIZE))
        : addImport(node, createIdentifier(DESERIALIZE_THROWING));
    if (converter == undefined) {
        throw new TsonError(node, `Could not find converter function for property: ${(node.name as Identifier).text}`)
    }
    return createCall(deserializeFunction, undefined, [json, metadata.name, converter]);
}
