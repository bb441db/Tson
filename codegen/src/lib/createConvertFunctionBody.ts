import {
    Block,
    ClassDeclaration,
    createCall,
    createExpressionStatement,
    createIdentifier,
    createKeywordTypeNode,
    createNew,
    createObjectLiteral,
    createPropertyAssignment,
    createReturn,
    createStringLiteral,
    createTypeReferenceNode,
    createUnionTypeNode,
    createUniqueName,
    createVariableDeclaration,
    createVariableDeclarationList,
    createVariableStatement,
    Declaration,
    Identifier,
    InterfaceDeclaration,
    isClassDeclaration,
    isInterfaceDeclaration,
    NodeFlags,
    Program,
    PropertyAssignment,
    SyntaxKind,
    Type
} from "typescript";
import BlockBuilder from "./builders/BlockBuilder";
import findConstructor from "./utils/findConstructor";
import createDeserializerExpression from "./utils/createDeserializerExpression";
import isOptional from "./utils/isOptional";
import {
    ASSIGN_IF_NOT_NULL,
    ASSIGN_OR_THROW,
    DESERIALIZE,
    DESERIALIZE_THROWING,
    DESERIALIZED_INSTANCE_NAME
} from "./constants";
import collectClassDeclarationProperties from "./utils/collectClassDeclarationProperties";
import getPropertyMetadata from "./utils/getPropertyMetadata";
import getConverter from "./utils/getConverter";
import addImport from "./utils/addImport";
import TsonError from "./errors/TsonError";
import collectInterfaceDeclarationProperties from "./utils/collectInterfaceDeclarationProperties";

function createConstructorBlock(program: Program, node: ClassDeclaration, instanceIdentifier: Identifier, jsonIdentifier: Identifier): Block {
    const constructorParameters = findConstructor(program, node);
    const builder = new BlockBuilder().setMultiLine(true);
    const identifiers: Identifier[] = [];
    for (const parameter of constructorParameters) {
        const identifier = createUniqueName((parameter.name as Identifier).text);
        identifiers.push(identifier);
        const type = isOptional(parameter)
            ? createUnionTypeNode([ parameter.type, createKeywordTypeNode(SyntaxKind.UndefinedKeyword) ])
            : parameter.type;
        const variableDeclaration = createVariableDeclaration(identifier, type, createDeserializerExpression(program, parameter, instanceIdentifier, jsonIdentifier));
        builder.addStatement(createVariableStatement(undefined, createVariableDeclarationList([variableDeclaration], NodeFlags.Const)));
    }
    const variable = createVariableDeclaration(
        instanceIdentifier,
        createTypeReferenceNode(node.name, undefined),
        createNew(node.name, undefined, identifiers)
    );
    builder.addStatement(createVariableStatement(undefined, createVariableDeclarationList([variable], NodeFlags.Const)));
    return builder.build();
}

function createPropertyAssignmentBlock(program: Program, node: ClassDeclaration, instanceIdentifier, jsonIdentifier): Block {
    const checker = program.getTypeChecker();
    const builder = new BlockBuilder();
    for (const property of collectClassDeclarationProperties(program, node)) {
        const metadata = getPropertyMetadata(program, property);
        const converter = metadata.converter || getConverter(program, instanceIdentifier, property);
        const assignFunction = isOptional(property)
            ? addImport(node, createIdentifier(ASSIGN_IF_NOT_NULL))
            : addImport(node, createIdentifier(ASSIGN_OR_THROW));
        const call = createCall(assignFunction, undefined, [
            instanceIdentifier,
            createStringLiteral((property.name as Identifier).text),
            jsonIdentifier,
            metadata.name,
            converter,
        ]);
        builder.addStatement(createExpressionStatement(call));
    }
    return builder.build();
}

function createConvertFunctionBodyForClassDeclaration(program: Program, node: ClassDeclaration, jsonIdentifier: Identifier): Block {
    const instanceIdentfier = createUniqueName(DESERIALIZED_INSTANCE_NAME);
    const builder = new BlockBuilder().setMultiLine(true);
    const constructorBlock = createConstructorBlock(program, node, instanceIdentfier, jsonIdentifier);
    for (const statement of constructorBlock.statements) {
        builder.addStatement(statement);
    }
    const propertyAssignmentBlock = createPropertyAssignmentBlock(program, node, instanceIdentfier, jsonIdentifier);
    for (const statement of propertyAssignmentBlock.statements) {
        builder.addStatement(statement);
    }

    builder.addStatement(createReturn(instanceIdentfier));
    return builder.build();
}
function createConvertFunctionForInterfaceDeclaration(program: Program, node: InterfaceDeclaration, jsonIdentifier: Identifier): Block {
    const instanceIdentifier = createUniqueName(DESERIALIZED_INSTANCE_NAME);
    const builder = new BlockBuilder().setMultiLine(true);
    const propertyAssignments: PropertyAssignment[] = [];
    for (const property of collectInterfaceDeclarationProperties(program, node)) {
        const converter = getConverter(program, instanceIdentifier, property);
        const assignFunction = isOptional(property)
            ? addImport(node, createIdentifier(DESERIALIZE))
            : addImport(node, createIdentifier(DESERIALIZE_THROWING));
        const call = createCall(assignFunction, undefined, [
            jsonIdentifier,
            createStringLiteral((property.name as Identifier).text),
            converter,
        ]);
        propertyAssignments.push(createPropertyAssignment(
            property.name as Identifier,
            call
        ));
    }
    const objectLiteralExpression = createObjectLiteral(propertyAssignments);
    const variableDeclaration = createVariableDeclaration(instanceIdentifier, undefined, objectLiteralExpression);
    const variableStatement = createVariableStatement(undefined, createVariableDeclarationList([variableDeclaration], NodeFlags.Const))
    builder.addStatement(variableStatement);
    builder.addStatement(createReturn(instanceIdentifier));
    return builder.build();
}
function getDeclarationFromType(type: Type): Declaration | undefined {
    const { symbol } = type;
    if (symbol.valueDeclaration != null) return symbol.valueDeclaration;
    if (symbol.declarations != null && symbol.declarations.length > 0) return symbol.declarations[0];
    return undefined;
}

export default function createConvertFunctionBodyForType(program: Program, type: Type, jsonIdentifier: Identifier): Block {
    const declaration = getDeclarationFromType(type);
    const checker = program.getTypeChecker();
    if (declaration != null) {
        if (isClassDeclaration(declaration)) {
            return createConvertFunctionBodyForClassDeclaration(program, declaration, jsonIdentifier);
        } else if (isInterfaceDeclaration(declaration)) {
            return createConvertFunctionForInterfaceDeclaration(program, declaration, jsonIdentifier);
        } else {
            return new BlockBuilder().build();
        }
    }
    throw new TsonError(checker.typeToTypeNode(type), `Unable to get declaration of type ${type.symbol.getName()}.`);
}
