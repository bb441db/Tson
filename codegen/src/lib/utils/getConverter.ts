import {
    createCall,
    createIdentifier,
    createKeywordTypeNode,
    createPropertyAccess,
    escapeLeadingUnderscores,
    Expression,
    Identifier, isArrayTypeNode,
    isMethodDeclaration,
    ParameterDeclaration,
    Program,
    PropertyDeclaration,
    SyntaxKind,
    Type,
    TypeChecker,
    TypeNode, TypeParameter
} from "typescript";
import {
    CONVERT_TO_BOOLEAN,
    CONVERT_TO_DATE,
    CONVERT_TO_NUMBER,
    CONVERT_TO_OBJECT,
    CONVERT_TO_STRING, CREATE_ARRAY_CONVERTER,
    FROM_JSON_FN_NAME
} from "../constants";
import addImport from "./addImport";
import TsonError from "../errors/TsonError";

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

function getConverterForTypeNode(program: Program, instance: Identifier, type: TypeNode) {
    const checker = program.getTypeChecker();
    switch (type.kind) {
        case SyntaxKind.AnyKeyword:
            return undefined;
        case SyntaxKind.BooleanKeyword:
            return addImport(type, createIdentifier(CONVERT_TO_BOOLEAN));
        case SyntaxKind.NumberKeyword:
            return addImport(type, createIdentifier(CONVERT_TO_NUMBER));
        case SyntaxKind.StringKeyword:
            return addImport(type, createIdentifier(CONVERT_TO_STRING));
        case SyntaxKind.ObjectKeyword:
            return addImport(type, createIdentifier(CONVERT_TO_OBJECT));
        default:
            const typeFromTypeNode = checker.getTypeFromTypeNode(type);
            if (checker.typeToString(typeFromTypeNode) === 'Date') {
                return addImport(type, createIdentifier(CONVERT_TO_DATE));
            }
            if (isArrayTypeNode(type)) {
                const innerConverter = getConverterForTypeNode(program, instance, type.elementType);
                const createArrayConverter = addImport(type, createIdentifier(CREATE_ARRAY_CONVERTER));
                return createCall(createArrayConverter, undefined, [innerConverter]);
            }
            if (typeExportsJsonFunction(checker, typeFromTypeNode)) {
                return createPropertyAccess(createIdentifier(typeFromTypeNode.symbol.name), createIdentifier(FROM_JSON_FN_NAME));
            }
            return undefined;
    }
}

export default function getConverter(program: Program, instance: Identifier, member: ParameterDeclaration | PropertyDeclaration): Expression {
    const type = member.type || getImplicitType(member);
    const converter = getConverterForTypeNode(program, instance, type);
    if (converter != undefined) {
        return converter;
    }
    throw new TsonError(member, `Unable to find converter function for parameter ${member.name.getText()}`);
}
