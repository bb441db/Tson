import {
    createIdentifier,
    createKeywordTypeNode, createPropertyAccess,
    escapeLeadingUnderscores, Expression, Identifier,
    isMethodDeclaration,
    ParameterDeclaration, Program,
    PropertyDeclaration,
    SyntaxKind,
    Type, TypeChecker, TypeNode
} from "typescript";
import {
    CONVERT_TO_BOOLEAN, CONVERT_TO_DATE,
    CONVERT_TO_NUMBER,
    CONVERT_TO_OBJECT,
    CONVERT_TO_STRING,
    FROM_JSON_FN_NAME
} from "../constants";
import addImport from "./addImport";

function typeExportsJsonFunction(checker: TypeChecker, type: Type) {
    const { exports } = type.symbol;
    const jsonFn = exports.get(escapeLeadingUnderscores(FROM_JSON_FN_NAME));
    if (jsonFn && jsonFn.valueDeclaration) {
        const { valueDeclaration } = jsonFn;
        if (isMethodDeclaration(valueDeclaration)) {
            if (valueDeclaration.parameters && valueDeclaration.parameters.length > 0) {
                const firstParam = valueDeclaration.parameters[0];
                const paramTypeMatches = firstParam.type.kind === SyntaxKind.AnyKeyword;
                const typeMatches = type === checker.getTypeFromTypeNode(valueDeclaration.type);
                return typeMatches && paramTypeMatches;
            }
        }
    }
    return false;
}
function getImplicitType(member: ParameterDeclaration | PropertyDeclaration): TypeNode {
    return createKeywordTypeNode(SyntaxKind.AnyKeyword);
}
export default function getConverter(program: Program, instance: Identifier, member: ParameterDeclaration | PropertyDeclaration): Expression | undefined {
    const checker = program.getTypeChecker();
    const type = member.type || getImplicitType(member);
    switch (type.kind) {
        case SyntaxKind.AnyKeyword:
            return undefined;
        case SyntaxKind.BooleanKeyword:
            return addImport(member, createIdentifier(CONVERT_TO_BOOLEAN));
        case SyntaxKind.NumberKeyword:
            return addImport(member, createIdentifier(CONVERT_TO_NUMBER));
        case SyntaxKind.StringKeyword:
            return addImport(member, createIdentifier(CONVERT_TO_STRING));
        case SyntaxKind.ObjectKeyword:
            return addImport(member, createIdentifier(CONVERT_TO_OBJECT));
        default:
            const typeFromTypeNode = checker.getTypeFromTypeNode(type);
            if (checker.typeToString(typeFromTypeNode) === 'Date') {
                return addImport(member, createIdentifier(CONVERT_TO_DATE));
            }
            if (typeExportsJsonFunction(checker, typeFromTypeNode)) {
                return createPropertyAccess(instance, createIdentifier(FROM_JSON_FN_NAME));
            }
            return undefined;
    }
}
