import {
    Block,
    ClassDeclaration,
    createCall,
    createExpressionStatement, createIdentifier,
    createKeywordTypeNode,
    createNew,
    createReturn, createStringLiteral,
    createTypeReferenceNode,
    createUnionTypeNode,
    createUniqueName,
    createVariableDeclaration,
    createVariableDeclarationList,
    createVariableStatement,
    Identifier,
    NodeFlags,
    Program,
    SyntaxKind
} from "typescript";
import BlockBuilder from "./builders/BlockBuilder";
import findConstructor from "./utils/findConstructor";
import createDeserializerExpression from "./utils/createDeserializerExpression";
import isOptional from "./utils/isOptional";
import {ASSIGN_IF_NOT_NULL, ASSIGN_OR_THROW, DESERIALIZED_INSTANCE_NAME} from "./constants";
import collectProperties from "./utils/collectProperties";
import getPropertyMetadata from "./utils/getPropertyMetadata";
import getConverter from "./utils/getConverter";
import addImport from "./utils/addImport";

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
    const properties = collectProperties(program, node);
    for (const property of properties) {
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

export default function (program: Program, node: ClassDeclaration, jsonIdentifier: Identifier): Block {
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
