import {
    Block,
    ClassDeclaration,
    ClassElement,
    createAssignment,
    createBinary,
    createCall,
    createConditional,
    createElementAccess,
    createEmptyStatement,
    createExpressionStatement,
    createIdentifier,
    createIf,
    createIntersectionTypeNode,
    createKeywordTypeNode,
    createLiteral,
    createModifier,
    createNew,
    createNull,
    createParen,
    createPropertyAccess,
    createReturn,
    createTypeReferenceNode, createUnionTypeNode,
    createVariableDeclaration,
    createVariableDeclarationList,
    createVariableStatement,
    ElementAccessExpression,
    Expression,
    Identifier,
    isMethodDeclaration,
    isPropertyDeclaration,
    NodeFlags,
    ParameterDeclaration,
    Program,
    PropertyDeclaration,
    Statement,
    SyntaxKind,
    TypeNode
} from "typescript";
import IdentifierStore from "./IdentifierStore";
import MethodBuilder from "./builders/MethodBuilder";
import propertyUtilsFactory from "./utils/propertyUtilsFactory";
import decoratorUtilsFactory, {TsonPropData} from "./utils/decoratorUtilsFactory";
import BlockBuilder from "./builders/BlockBuilder";

const FROM_JSON_FN_NAME = 'fromJson';
const FROM_JSON_ARG_NAME = 'json';
const DESERIALIZED_INSTANCE_NAME = 'deserialized';

export default function (program: Program, node: ClassDeclaration) {
    const checker = program.getTypeChecker();
    const identifierStore = new IdentifierStore(checker, node);
    const { collectConstructorParameters, collectMembers } = propertyUtilsFactory(checker);
    const { getTsonPropData } = decoratorUtilsFactory(checker);

    const instanceIdentifier = identifierStore.createIdentifier(DESERIALIZED_INSTANCE_NAME);
    const jsonArgumentIdentifier = identifierStore.createIdentifier(FROM_JSON_ARG_NAME);
    const jsonFunctionIdentifier = identifierStore.createIdentifier(FROM_JSON_FN_NAME);

    function isBuildInType(type: TypeNode): boolean {
        if (type == null) return true; // implicit any
        return [ SyntaxKind.AnyKeyword, SyntaxKind.StringKeyword, SyntaxKind.NumberKeyword, SyntaxKind.BooleanKeyword ].includes(type.kind);
    }

    function isOptionalPropertyDeclaration(member: PropertyDeclaration | ParameterDeclaration): boolean {
        return member.questionToken != null || member.initializer != null;
    }

    function typeExportsJsonFunction(typeNode: TypeNode) {
        const type = checker.getTypeFromTypeNode(typeNode);
        const { exports } = type.symbol;
        const jsonFn = exports.get(jsonFunctionIdentifier.escapedText);
        if (jsonFn && jsonFn.valueDeclaration) {
            const { valueDeclaration } = jsonFn;
            if (isMethodDeclaration(valueDeclaration)) {
                if (valueDeclaration.parameters && valueDeclaration.parameters.length > 0) {
                    const firstParam = valueDeclaration.parameters[0];
                    const paramNameMatches = (firstParam.name as Identifier).text === jsonArgumentIdentifier.text;
                    const paramTypeMatches = firstParam.type.kind === SyntaxKind.AnyKeyword;
                    const typeMatches = type === checker.getTypeFromTypeNode(valueDeclaration.type);
                    return typeMatches && paramNameMatches && paramTypeMatches;
                }
            }
        }
        return false;
    }

    function typeIsDate(typeNode: TypeNode) {
        const typeName = checker.typeToString(checker.getTypeFromTypeNode(typeNode));
        return typeName === 'Date';
    }

    function createConstructorArgumentsArray(classDeclaration: ClassDeclaration) {
        return collectConstructorParameters(classDeclaration).map(createSerializerExpression);
    }

    function createUndefined(): Identifier {
        return createIdentifier('undefined');
    }

    function createConstructBlock(classDeclaration: ClassDeclaration): Block {
        const classIdentifier = createIdentifier(classDeclaration.name.text);
        const constructorParameters = collectConstructorParameters(classDeclaration);
        const blockBuilder = new BlockBuilder().setMultiLine(true);
        const identifiers: Expression[] = [];
        for (const parameter of constructorParameters) {
            const identifier = parameter.name as Identifier;
            identifiers.push(identifier);
            const type = parameter.questionToken ? createUnionTypeNode([ parameter.type, createKeywordTypeNode(SyntaxKind.UndefinedKeyword) ]) : parameter.type;
            const variableDeclaration = createVariableDeclaration(identifier, type, createSerializerExpression(parameter));
            blockBuilder.addStatement(createVariableStatement(undefined, createVariableDeclarationList([variableDeclaration], NodeFlags.Const)));
        }

        const variable = createVariableDeclaration(
            instanceIdentifier,
            createTypeReferenceNode(classDeclaration.name, undefined),
            createNew(classIdentifier, undefined, identifiers)
        );
        blockBuilder.addStatement(createVariableStatement(undefined, createVariableDeclarationList([variable], NodeFlags.Const)));
        return blockBuilder.build();
    }

    function createJsonAccess(expression: Expression): ElementAccessExpression {
        return createElementAccess(jsonArgumentIdentifier, expression);
    }

    function createConstructAndReturn(classDeclaration: ClassDeclaration): Statement {
        const classIdentifier = createIdentifier(classDeclaration.name.text);
        return createReturn(createNew(classIdentifier, undefined, createConstructorArgumentsArray(classDeclaration)))
    }

    function createReturnInstanceStatement(): Statement {
        return createReturn(instanceIdentifier);
    }

    function createBuiltInSerializerFunction(member: PropertyDeclaration | ParameterDeclaration, expression: Expression): Expression {
        const kind = member.type ? member.type.kind : SyntaxKind.AnyKeyword;
        switch (kind) {
            case SyntaxKind.StringKeyword:
                return createCall(createIdentifier('String'), undefined, [expression]);
            case SyntaxKind.NumberKeyword:
                return createCall(createIdentifier('Number'), undefined, [expression]);
            case SyntaxKind.BooleanKeyword:
                return createCall(createIdentifier('Boolean'), undefined, [expression]);
            case SyntaxKind.AnyKeyword:
            default:
                return expression;
        }
    }

    function createSerializerFunction(member: PropertyDeclaration | ParameterDeclaration): Expression {
        const tsonPropData = getTsonPropData(member);
        const getJsonPropertyExpression = createElementAccess(jsonArgumentIdentifier, tsonPropData.name);
        if (tsonPropData.converter != null) {
            return createCall(createParen(tsonPropData.converter), undefined, [getJsonPropertyExpression]);
        }
        if (isBuildInType(member.type)) {
            return createBuiltInSerializerFunction(member, getJsonPropertyExpression);
        }
        if (typeExportsJsonFunction(member.type)) {
            const typeName = checker.typeToString(checker.getTypeFromTypeNode(member.type));
            const propertyAccess = createPropertyAccess(createIdentifier(typeName), createIdentifier(FROM_JSON_FN_NAME));
            return createCall(propertyAccess, undefined, [getJsonPropertyExpression]);
        }
        if (typeIsDate(member.type)) {
            return createNew(createIdentifier('Date'), undefined, [getJsonPropertyExpression]);
        }
        return getJsonPropertyExpression;
    }

    function createAssignmentStatement(member: PropertyDeclaration) {
        const leftSide = createPropertyAccess(instanceIdentifier, member.name as Identifier);
        const assignment = createAssignment(leftSide, createSerializerFunction(member));
        return createExpressionStatement(assignment);
    }

    function createOptionalSerializerStatement(member: PropertyDeclaration): Statement {
        const jsonAccessExpression = createElementAccess(jsonArgumentIdentifier, createLiteral(member.name as Identifier));
        const statement = createBinary(jsonAccessExpression, SyntaxKind.ExclamationEqualsToken, createNull());
        return createIf(statement, createAssignmentStatement(member));
    }

    function createSerializerStatement(member: ClassElement): Statement {
        if (isPropertyDeclaration(member)) {
            if (isOptionalPropertyDeclaration(member)) {
                return createOptionalSerializerStatement(member);
            }
            return createAssignmentStatement(member);
        }
        return createEmptyStatement();
    }

    function createConditionalSerializerExpression(parameter: ParameterDeclaration, tson: TsonPropData): Expression {
        const jsonAccessExpression = createElementAccess(jsonArgumentIdentifier, tson.name);
        const statement = createBinary(jsonAccessExpression, SyntaxKind.ExclamationEqualsToken, createNull());
        return createConditional(statement, createSerializerFunction(parameter), parameter.initializer || createUndefined());
    }

    function createSerializerExpression(parameter: ParameterDeclaration): Expression {
        const tson = getTsonPropData(parameter);
        if (isOptionalPropertyDeclaration(parameter)) {
            return createConditionalSerializerExpression(parameter, tson);
        } else {
            return createSerializerFunction(parameter);
        }
    }

    function createToJsonMethodFor(classDeclaration: ClassDeclaration): ClassElement {
        const builder = new MethodBuilder()
            .addModifiers(createModifier(SyntaxKind.PublicKeyword))
            .addModifiers(createModifier(SyntaxKind.StaticKeyword))
            .setName(FROM_JSON_FN_NAME)
            .addParameter(jsonArgumentIdentifier, createKeywordTypeNode(SyntaxKind.AnyKeyword))
            .setType(createTypeReferenceNode(classDeclaration.name, undefined))
            .updateBody(builder => builder.setMultiLine(true));

        if (!classDeclaration.members || classDeclaration.members.length === 0) {
            builder.updateBody(block => block.addStatement(createConstructAndReturn(classDeclaration)));
            return builder.build();
        }

        builder.updateBody(block => block.addStatements(createConstructBlock(classDeclaration).statements));

        const members = collectMembers(classDeclaration);

        for (const statement of members.map(createSerializerStatement)) {

            builder.updateBody(block => block.addStatement(statement))
        }

        builder.updateBody(block => block.addStatement(createReturnInstanceStatement()));

        return builder.build();
    }
    return createToJsonMethodFor(node);
}
