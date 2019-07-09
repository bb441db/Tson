import * as ts from 'typescript';
import {
    ClassDeclaration,
    ClassElement, ConstructorDeclaration,
    createAssignment,
    createBinary,
    createCall, createConditional,
    createElementAccess,
    createEmptyStatement,
    createExpressionStatement,
    createIdentifier,
    createIf, createImmediatelyInvokedFunctionExpression,
    createKeywordTypeNode,
    createLiteral,
    createModifier,
    createNew,
    createNodeArray,
    createNull, createParen,
    createPropertyAccess,
    createReturn, createTempVariable, createTypeOf,
    createTypeReferenceNode,
    createVariableDeclaration,
    createVariableStatement,
    Decorator,
    escapeLeadingUnderscores,
    Expression,
    FunctionDeclaration,
    FunctionLike,
    getMutableClone,
    Identifier,
    ImportDeclaration,
    isBindingElement,
    isCallOrNewExpression,
    isClassDeclaration, isConstructorDeclaration,
    isDecorator,
    isFunctionDeclaration,
    isFunctionExpression,
    isFunctionLike,
    isFunctionTypeNode,
    isIdentifier,
    isImportDeclaration,
    isMethodDeclaration,
    isMethodSignature,
    isNamedImports,
    isObjectLiteralElement,
    isObjectLiteralExpression, isParameter,
    isParameterPropertyDeclaration,
    isPropertyAssignment,
    isPropertyDeclaration,
    isPropertySignature,
    isStringLiteral, isTypeParameterDeclaration,
    isVariableDeclaration,
    NodeArray,
    NodeFlags,
    Program,
    PropertyDeclaration, QuestionToken,
    Statement,
    SyntaxKind,
    TransformationContext,
    TypeNode
} from 'typescript';
import MethodBuilder from "./builders/MethodBuilder";
import {create} from "domain";
import {ParameterDeclaration} from "typescript";

const decorators = [ 'Tson', 'TsonProp', 'TsonIgnore' ];

const FROM_JSON_FN_NAME = 'fromJson';
const FROM_JSON_ARG_NAME = '_json';
const DESERIALIZED_INSTANCE_NAME = '_deserialized';

interface TsonPropData {
    name: Expression;
    converter: Expression | null;
}

export default function Transformer(program: Program) {

    const checker = program.getTypeChecker();

    function updateImport(node: ImportDeclaration): ImportDeclaration | undefined {
        if (isNamedImports(node.importClause.namedBindings)) {
            /*if (node.importClause.namedBindings.elements.every(element => decorators.includes(element.propertyName.text))) {
                return undefined;
            }*/
        }
        return node;
    }

    function shouldRemoveDecorator(node: Decorator): boolean {
        return decorators.includes(node.expression['escapedText']) || shouldRemoveDecorator((node['expression'] as unknown) as Decorator);
    }

    function hasStaticKeyword(member: ClassElement): boolean {
        return member.modifiers.map(mod => mod.kind).includes(SyntaxKind.StaticKeyword);
    }

    function hasReadonlyKeyword(member: ClassElement): boolean {
        return member.modifiers.map(mod => mod.kind).includes(SyntaxKind.ReadonlyKeyword);
    }

    function hasPrivateKeyword(member: ClassElement): boolean {
        return member.modifiers.map(mod => mod.kind).includes(SyntaxKind.PrivateKeyword);
    }

    function isSerializableInheritedProperty(member: ClassElement, members: ClassElement[]): boolean {
        return isSerializableProperty(member)
            && !hasPrivateKeyword(member)
            && members.findIndex(m => (m.name as Identifier).text === (member.name as Identifier).text) === -1;
    }

    function isSerializableProperty(member: ClassElement): boolean {
        return isPropertyDeclaration(member) && !hasReadonlyKeyword(member) && !hasStaticKeyword(member) && !hasTsonIgnoreDecorator(member);
    }

    function hasTsonIgnoreDecorator(member: ClassElement): boolean {
        if (member.decorators && member.decorators.length > 0) {
            for (const decorator of member.decorators) {
                if (isDecorator(decorator) && isIdentifier(decorator.expression)) {
                    if (decorator.expression.text === 'TsonIgnore') {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function getConstructorDeclaration(classDeclaration: ClassDeclaration): ConstructorDeclaration | null {
        if (classDeclaration.members && classDeclaration.members.length > 0) {
            for (const member of classDeclaration.members) {
                if (isConstructorDeclaration(member)) {
                    return member;
                }
            }
        }
        return null;
    }

    function collectConstructorParameters(classDeclaration: ClassDeclaration): ReadonlyArray<ParameterDeclaration> {
        const constructorDeclaration = getConstructorDeclaration(classDeclaration);
        if (constructorDeclaration == null || !(constructorDeclaration.parameters && constructorDeclaration.parameters.length > 0)) return [];
        const parameters: ParameterDeclaration[] = [];
        for (const parameter of constructorDeclaration.parameters) {
            if (isParameter(parameter)) {
                parameters.push(parameter);
            }
        }
        return parameters;
    }

    function createConstructorArgumentsArray(classDeclaration: ClassDeclaration) {
        return collectConstructorParameters(classDeclaration).map(createSerializerExpression);
    }

    function createConstructStatement(classDeclaration: ClassDeclaration): Statement {
        const classIdentifier = createIdentifier(classDeclaration.name.text);
        const variable = createVariableDeclaration(
            DESERIALIZED_INSTANCE_NAME,
            createTypeReferenceNode(classDeclaration.name, undefined),
            createNew(classIdentifier, undefined, createConstructorArgumentsArray(classDeclaration))
        );
        return createVariableStatement(undefined, [ variable ]);
    }

    function createConstructAndReturn(classDeclaration: ClassDeclaration): Statement {
        const classIdentifier = createIdentifier(classDeclaration.name.text);
        return createReturn(createNew(classIdentifier, undefined, createConstructorArgumentsArray(classDeclaration)))
    }

    function createReturnInstanceStatement(): Statement {
        const instanceIdentifier = createIdentifier(DESERIALIZED_INSTANCE_NAME);
        return createReturn(instanceIdentifier);
    }

    function isBuildInType(type: TypeNode): boolean {
        if (type == null) return true; // implicit any
        return [ SyntaxKind.AnyKeyword, SyntaxKind.StringKeyword, SyntaxKind.NumberKeyword, SyntaxKind.BooleanKeyword ].includes(type.kind);
    }

    function getTsonPropData(member: PropertyDeclaration | ParameterDeclaration): TsonPropData {
        const data: TsonPropData = {
            name: createLiteral((member.name as Identifier).text),
            converter: null,
        };
        if (member.decorators && member.decorators.length > 0) {
            for (const decorator of member.decorators) {
                const expression = decorator.expression;
                if (isCallOrNewExpression(expression) && expression.arguments && expression.arguments.length === 1) {
                    const argument = expression.arguments[0];
                    if (isObjectLiteralExpression(argument)) {
                        if (argument.properties && argument.properties.length > 0) {
                            for (const property of argument.properties) {
                                //type HasInitializer = HasExpressionInitializer | ForStatement | ForInStatement | ForOfStatement | JsxAttribute;
                                //type HasExpressionInitializer = VariableDeclaration | ParameterDeclaration | BindingElement | PropertySignature | PropertyDeclaration | PropertyAssignment | EnumMember;
                                if (isIdentifier(property.name) && property.name.text === 'name' && isPropertyAssignment(property)) {
                                    data.name = property.initializer;
                                }
                                if (isIdentifier(property.name) && property.name.text === 'converter' && isPropertyAssignment(property)) {
                                    data.converter = property.initializer;
                                }
                            }
                        }
                    }
                    if (isFunctionLike(argument)) {
                        data.converter = argument;
                    }
                    if (isStringLiteral(argument)) {
                        data.name = createLiteral(argument.text);
                    }
                }
            }
        }
        return data;
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

    function typeExportsJsonFunction(typeNode: TypeNode) {
        const type = checker.getTypeFromTypeNode(typeNode);
        const { exports } = type.symbol;
        const jsonFn = exports.get(escapeLeadingUnderscores(FROM_JSON_FN_NAME));
        if (jsonFn && jsonFn.valueDeclaration) {
            const { valueDeclaration } = jsonFn;
            if (isMethodDeclaration(valueDeclaration)) {
                if (valueDeclaration.parameters && valueDeclaration.parameters.length > 0) {
                    const firstParam = valueDeclaration.parameters[0];
                    const paramNameMatches = (firstParam.name as Identifier).text === FROM_JSON_ARG_NAME;
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

    function createSerializerFunction(member: PropertyDeclaration | ParameterDeclaration): Expression {
        const tsonPropData = getTsonPropData(member);
        const getJsonPropertyExpression = createElementAccess(createIdentifier(FROM_JSON_ARG_NAME), tsonPropData.name);
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
        const leftSide = createPropertyAccess(createIdentifier(DESERIALIZED_INSTANCE_NAME), member.name as Identifier);
        const assignment = createAssignment(leftSide, createSerializerFunction(member));
        return createExpressionStatement(assignment);
    }

    function createOptionalSerializerStatement(member: PropertyDeclaration): Statement {
        const jsonAccessExpression = createElementAccess(createIdentifier(FROM_JSON_ARG_NAME), createLiteral(member.name as Identifier));
        const statement = createBinary(jsonAccessExpression, SyntaxKind.ExclamationEqualsToken, createNull());
        return createIf(statement, createAssignmentStatement(member));
    }

    function createConditionalSerializerExpression(member: ParameterDeclaration): Expression {
        const jsonAccessExpression = createElementAccess(createIdentifier(FROM_JSON_ARG_NAME), createLiteral(member.name as Identifier));
        const statement = createBinary(jsonAccessExpression, SyntaxKind.ExclamationEqualsToken, createNull());
        return createConditional(statement, createSerializerFunction(member), member.initializer);
    }

    function isOptionalPropertyDeclaration(member: PropertyDeclaration | ParameterDeclaration): boolean {
        return member.questionToken != null || member.initializer != null;
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

    function createSerializerExpression(parameter: ParameterDeclaration): Expression {
        const jsonAccessExpression = createElementAccess(createIdentifier(FROM_JSON_ARG_NAME), createLiteral(parameter.name as Identifier));
        const statement = createBinary(jsonAccessExpression, SyntaxKind.ExclamationEqualsToken, createNull());
        if (isOptionalPropertyDeclaration(parameter)) {
            return createConditional(statement, createSerializerFunction(parameter), parameter.initializer || createNull());
        } else {
            return createSerializerFunction(parameter);
        }
    }

    function collectMembers(classDeclaration: ClassDeclaration): NodeArray<ClassElement> {

        function collectInheritedMembers(inheritedClassDeclaration: ClassDeclaration, members: ClassElement[]) {
            const accessibleMembers = inheritedClassDeclaration.members.filter(member => isSerializableInheritedProperty(member, members));
            members.push(...accessibleMembers);
            if (inheritedClassDeclaration.heritageClauses && inheritedClassDeclaration.heritageClauses.length > 0) {
                for (const hc of inheritedClassDeclaration.heritageClauses.filter(hc => hc.types && hc.types.length > 0)) {
                    for (const hct of hc.types) {
                        const declaration = checker.getTypeFromTypeNode(hct).symbol.valueDeclaration;
                        if (isClassDeclaration(declaration)) {
                            collectInheritedMembers(declaration, members);
                        }
                    }
                }
            }
        }
        const members = [...classDeclaration.members.filter(isSerializableProperty)];
        if (classDeclaration.heritageClauses && classDeclaration.heritageClauses.length > 0) {
            for (const hc of classDeclaration.heritageClauses.filter(hc => hc.types && hc.types.length > 0)) {
                for (const hct of hc.types) {
                    const declaration = checker.getTypeFromTypeNode(hct).symbol.valueDeclaration;
                    if (isClassDeclaration(declaration)) {
                        collectInheritedMembers(declaration, members);
                    }
                }
            }
        }
        return createNodeArray(members);
    }

    function createToJsonMethodFor(classDeclaration: ClassDeclaration): ClassElement {
        const builder = new MethodBuilder()
            .addModifiers(createModifier(SyntaxKind.PublicKeyword))
            .addModifiers(createModifier(SyntaxKind.StaticKeyword))
            .setName(FROM_JSON_FN_NAME)
            .addParameter(FROM_JSON_ARG_NAME, createKeywordTypeNode(SyntaxKind.AnyKeyword))
            .setType(createTypeReferenceNode(classDeclaration.name, undefined))
            .updateBody(builder => builder.setMultiLine(true));


        if (!classDeclaration.members || classDeclaration.members.length === 0) {
            builder.updateBody(block => block.addStatement(createConstructAndReturn(classDeclaration)));
            return builder.build();
        }

        builder.updateBody(block => block.addStatement(createConstructStatement(classDeclaration)));

        const members = collectMembers(classDeclaration);

        for (const statement of members.map(createSerializerStatement)) {
            builder.updateBody(block => block.addStatement(statement))
        }

        builder.updateBody(block => block.addStatement(createReturnInstanceStatement()));

        return builder.build();
    }

    return function transform<T extends ts.Node>(context: TransformationContext) {
        return function (rootNode: T) {
            function visit(node: ts.Node): ts.Node {
                if (isImportDeclaration(node)) {
                    return updateImport(node);
                }
                if (isDecorator(node) && shouldRemoveDecorator(node)) {
                    return undefined;
                }
                if (isClassDeclaration(node)) {
                    const classElement = createToJsonMethodFor(node);
                    const clone = getMutableClone(node);
                    clone.members = ts.createNodeArray([...node.members, classElement]);
                    node = clone;
                }
                return ts.visitEachChild(node, (child) => visit(child), context);
            }
            return ts.visitNode(rootNode, visit);
        }
    }
};
