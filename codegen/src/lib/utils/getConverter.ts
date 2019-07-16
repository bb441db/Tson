import {
    ArrayTypeNode,
    createArrowFunction,
    createCall,
    createIdentifier,
    createKeywordTypeNode,
    createParameter,
    createPropertyAccess,
    createToken,
    createUniqueName,
    escapeLeadingUnderscores,
    Expression,
    Identifier,
    isMethodDeclaration,
    ParameterDeclaration,
    Program,
    PropertyDeclaration,
    PropertySignature,
    SyntaxKind,
    Type,
    TypeChecker,
    TypeNode,
    TypeReferenceNode
} from "typescript";
import {
    CONVERT_TO_BOOLEAN,
    CONVERT_TO_DATE,
    CONVERT_TO_NUMBER,
    CONVERT_TO_OBJECT,
    CONVERT_TO_STRING,
    CREATE_ARRAY_CONVERTER,
    FROM_JSON_ARG_NAME,
    FROM_JSON_FN_NAME
} from "../constants";
import addImport from "./addImport";
import TsonError from "../errors/TsonError";
import createConvertFunctionBodyForType from "../createConvertFunctionBody";

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
function isDateType(type: Type) {
    return type.symbol.getName() === 'Date';
}
function getImplicitType(member: ParameterDeclaration | PropertyDeclaration | PropertySignature): TypeNode {
    return createKeywordTypeNode(SyntaxKind.AnyKeyword);
}
function getDeclarationFromTypeReference(checker: TypeChecker, reference: TypeReferenceNode): Type {
    const { symbol } = checker.getTypeFromTypeNode(reference);
    return checker.getDeclaredTypeOfSymbol(symbol);
}
function generateFunctionForType(program: Program, type: Type): Expression {
    const checker = program.getTypeChecker();
    const jsonIdentfier = createUniqueName(FROM_JSON_ARG_NAME);
    const parameter = createParameter(
        undefined,
        undefined,
        undefined,
        jsonIdentfier,
        undefined,
        createKeywordTypeNode(SyntaxKind.AnyKeyword),
        undefined
    );
    const body = createConvertFunctionBodyForType(program, type, jsonIdentfier);
    return createArrowFunction(
        undefined,
        undefined,
        [parameter],
        checker.typeToTypeNode(type),
        createToken(SyntaxKind.EqualsGreaterThanToken),
        body,
    )
}
function getConverterForTypeReferenceNode(program: Program, typeReferenceNode: TypeReferenceNode): Expression | undefined {
    const checker = program.getTypeChecker();
    const referencedType = getDeclarationFromTypeReference(checker, typeReferenceNode);
    if (referencedType != null) {
        if (referencedType.isClass() && typeExportsJsonFunction(checker, referencedType)) {
            return createPropertyAccess(createIdentifier(referencedType.symbol.name), createIdentifier(FROM_JSON_FN_NAME));
        } else if (referencedType.isClassOrInterface() && isDateType(referencedType)) {
            return addImport(typeReferenceNode, createIdentifier(CONVERT_TO_DATE));
        } else {
            return generateFunctionForType(program, referencedType);
        }
    }
    return undefined;
}
function getConverterForTypeNode(program: Program, instance: Identifier, type: TypeNode) {
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
        case SyntaxKind.ArrayType:
            const innerConverter = getConverterForTypeNode(program, instance, (type as ArrayTypeNode).elementType);
            const createArrayConverter = addImport(type, createIdentifier(CREATE_ARRAY_CONVERTER));
            return createCall(createArrayConverter, undefined, [innerConverter]);
        case SyntaxKind.TypeReference:
            return getConverterForTypeReferenceNode(program, type as TypeReferenceNode);
        default:
            console.log('SyntaxKind', type.kind);
            return undefined;
    }
}

export default function getConverter(program: Program, instance: Identifier, member: ParameterDeclaration | PropertyDeclaration | PropertySignature): Expression {
    const type = member.type || getImplicitType(member);
    const converter = getConverterForTypeNode(program, instance, type);
    if (converter != undefined) {
        return converter;
    }
    throw new TsonError(member, `Unable to find converter function for parameter ${member.name.getText()}`);
}
