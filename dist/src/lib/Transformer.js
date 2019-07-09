"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const typescript_1 = require("typescript");
const MethodBuilder_1 = require("./builders/MethodBuilder");
const decorators = ['Tson', 'TsonProp', 'TsonIgnore'];
const FROM_JSON_FN_NAME = 'fromJson';
const FROM_JSON_ARG_NAME = '_json';
const DESERIALIZED_INSTANCE_NAME = '_deserialized';
function Transformer(program) {
    const checker = program.getTypeChecker();
    function updateImport(node) {
        if (typescript_1.isNamedImports(node.importClause.namedBindings)) {
            /*if (node.importClause.namedBindings.elements.every(element => decorators.includes(element.propertyName.text))) {
                return undefined;
            }*/
        }
        return node;
    }
    function shouldRemoveDecorator(node) {
        return decorators.includes(node.expression['escapedText']) || shouldRemoveDecorator(node['expression']);
    }
    function hasStaticKeyword(member) {
        return member.modifiers.map(mod => mod.kind).includes(typescript_1.SyntaxKind.StaticKeyword);
    }
    function hasReadonlyKeyword(member) {
        return member.modifiers.map(mod => mod.kind).includes(typescript_1.SyntaxKind.ReadonlyKeyword);
    }
    function hasPrivateKeyword(member) {
        return member.modifiers.map(mod => mod.kind).includes(typescript_1.SyntaxKind.PrivateKeyword);
    }
    function isSerializableInheritedProperty(member, members) {
        return isSerializableProperty(member)
            && !hasPrivateKeyword(member)
            && members.findIndex(m => m.name.text === member.name.text) === -1;
    }
    function isSerializableProperty(member) {
        return typescript_1.isPropertyDeclaration(member) && !hasReadonlyKeyword(member) && !hasStaticKeyword(member) && !hasTsonIgnoreDecorator(member);
    }
    function hasTsonIgnoreDecorator(member) {
        if (member.decorators && member.decorators.length > 0) {
            for (const decorator of member.decorators) {
                if (typescript_1.isDecorator(decorator) && typescript_1.isIdentifier(decorator.expression)) {
                    if (decorator.expression.text === 'TsonIgnore') {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    function createConstructStatement(classDeclaration) {
        const classIdentifier = typescript_1.createIdentifier(classDeclaration.name.text);
        const variable = typescript_1.createVariableDeclaration(DESERIALIZED_INSTANCE_NAME, typescript_1.createTypeReferenceNode(classDeclaration.name, undefined), typescript_1.createNew(classIdentifier, undefined, undefined));
        return typescript_1.createVariableStatement(undefined, [variable]);
    }
    function createConstructAndReturn(classDeclaration) {
        const classIdentifier = typescript_1.createIdentifier(classDeclaration.name.text);
        return typescript_1.createReturn(typescript_1.createNew(classIdentifier, undefined, undefined));
    }
    function createReturnInstanceStatement() {
        const instanceIdentifier = typescript_1.createIdentifier(DESERIALIZED_INSTANCE_NAME);
        return typescript_1.createReturn(instanceIdentifier);
    }
    function isBuildInType(type) {
        if (type == null)
            return true; // implicit any
        return [typescript_1.SyntaxKind.AnyKeyword, typescript_1.SyntaxKind.StringKeyword, typescript_1.SyntaxKind.NumberKeyword, typescript_1.SyntaxKind.BooleanKeyword].includes(type.kind);
    }
    function getTsonPropData(member) {
        const data = {
            name: typescript_1.createLiteral(member.name.text),
            converter: null,
        };
        if (member.decorators && member.decorators.length > 0) {
            for (const decorator of member.decorators) {
                const expression = decorator.expression;
                if (typescript_1.isCallOrNewExpression(expression) && expression.arguments && expression.arguments.length === 1) {
                    const argument = expression.arguments[0];
                    if (typescript_1.isObjectLiteralExpression(argument)) {
                        if (argument.properties && argument.properties.length > 0) {
                            for (const property of argument.properties) {
                                //type HasInitializer = HasExpressionInitializer | ForStatement | ForInStatement | ForOfStatement | JsxAttribute;
                                //type HasExpressionInitializer = VariableDeclaration | ParameterDeclaration | BindingElement | PropertySignature | PropertyDeclaration | PropertyAssignment | EnumMember;
                                if (typescript_1.isIdentifier(property.name) && property.name.text === 'name' && typescript_1.isPropertyAssignment(property)) {
                                    data.name = property.initializer;
                                }
                                if (typescript_1.isIdentifier(property.name) && property.name.text === 'converter' && typescript_1.isPropertyAssignment(property)) {
                                    data.converter = property.initializer;
                                }
                            }
                        }
                    }
                    if (typescript_1.isFunctionLike(argument)) {
                        data.converter = argument;
                    }
                    if (typescript_1.isStringLiteral(argument)) {
                        data.name = typescript_1.createLiteral(argument.text);
                    }
                }
            }
        }
        return data;
    }
    function createBuiltInSerializerFunction(member, expression) {
        const kind = member.type ? member.type.kind : typescript_1.SyntaxKind.AnyKeyword;
        switch (kind) {
            case typescript_1.SyntaxKind.StringKeyword:
                return typescript_1.createCall(typescript_1.createIdentifier('String'), undefined, [expression]);
            case typescript_1.SyntaxKind.NumberKeyword:
                return typescript_1.createCall(typescript_1.createIdentifier('Number'), undefined, [expression]);
            case typescript_1.SyntaxKind.BooleanKeyword:
                return typescript_1.createCall(typescript_1.createIdentifier('Boolean'), undefined, [expression]);
            case typescript_1.SyntaxKind.AnyKeyword:
            default:
                return expression;
        }
    }
    function typeExportsJsonFunction(typeNode) {
        const type = checker.getTypeFromTypeNode(typeNode);
        const { exports } = type.symbol;
        const jsonFn = exports.get(typescript_1.escapeLeadingUnderscores(FROM_JSON_FN_NAME));
        if (jsonFn && jsonFn.valueDeclaration) {
            const { valueDeclaration } = jsonFn;
            if (typescript_1.isMethodDeclaration(valueDeclaration)) {
                if (valueDeclaration.parameters && valueDeclaration.parameters.length > 0) {
                    const firstParam = valueDeclaration.parameters[0];
                    const paramNameMatches = firstParam.name.text === FROM_JSON_ARG_NAME;
                    const paramTypeMatches = firstParam.type.kind === typescript_1.SyntaxKind.AnyKeyword;
                    const typeMatches = type === checker.getTypeFromTypeNode(valueDeclaration.type);
                    return typeMatches && paramNameMatches && paramTypeMatches;
                }
            }
        }
        return false;
    }
    function typeIsDate(typeNode) {
        const typeName = checker.typeToString(checker.getTypeFromTypeNode(typeNode));
        return typeName === 'Date';
    }
    function createSerializerFunction(member, propData, expression) {
        if (propData.converter != null) {
            return typescript_1.createCall(typescript_1.createParen(propData.converter), undefined, [expression]);
        }
        if (isBuildInType(member.type)) {
            return createBuiltInSerializerFunction(member, expression);
        }
        if (typeExportsJsonFunction(member.type)) {
            const typeName = checker.typeToString(checker.getTypeFromTypeNode(member.type));
            const propertyAccess = typescript_1.createPropertyAccess(typescript_1.createIdentifier(typeName), typescript_1.createIdentifier(FROM_JSON_FN_NAME));
            return typescript_1.createCall(propertyAccess, undefined, [expression]);
        }
        if (typeIsDate(member.type)) {
            return typescript_1.createNew(typescript_1.createIdentifier('Date'), undefined, [expression]);
        }
        return expression;
    }
    function createAssignmentStatement(member) {
        const tsonPropData = getTsonPropData(member);
        const leftSide = typescript_1.createPropertyAccess(typescript_1.createIdentifier(DESERIALIZED_INSTANCE_NAME), member.name);
        const getJsonPropertyExpression = typescript_1.createElementAccess(typescript_1.createIdentifier(FROM_JSON_ARG_NAME), tsonPropData.name);
        const assignment = typescript_1.createAssignment(leftSide, createSerializerFunction(member, tsonPropData, getJsonPropertyExpression));
        return typescript_1.createExpressionStatement(assignment);
    }
    function createOptionalSerializerStatement(member) {
        const jsonAccessExpression = typescript_1.createElementAccess(typescript_1.createIdentifier(FROM_JSON_ARG_NAME), typescript_1.createLiteral(member.name));
        const ifStatement = typescript_1.createBinary(jsonAccessExpression, typescript_1.SyntaxKind.ExclamationEqualsToken, typescript_1.createNull());
        return typescript_1.createIf(ifStatement, createAssignmentStatement(member));
    }
    function isOptionalPropertyDeclaration(member) {
        return member.questionToken != null || member.initializer != null;
    }
    function createSerializerStatement(member) {
        if (typescript_1.isPropertyDeclaration(member)) {
            if (isOptionalPropertyDeclaration(member)) {
                return createOptionalSerializerStatement(member);
            }
            return createAssignmentStatement(member);
        }
        return typescript_1.createEmptyStatement();
    }
    function collectMembers(classDeclaration) {
        function collectInheritedMembers(inheritedClassDeclaration, members) {
            const accessibleMembers = inheritedClassDeclaration.members.filter(member => isSerializableInheritedProperty(member, members));
            members.push(...accessibleMembers);
            if (inheritedClassDeclaration.heritageClauses && inheritedClassDeclaration.heritageClauses.length > 0) {
                for (const hc of inheritedClassDeclaration.heritageClauses.filter(hc => hc.types && hc.types.length > 0)) {
                    for (const hct of hc.types) {
                        const declaration = checker.getTypeFromTypeNode(hct).symbol.valueDeclaration;
                        if (typescript_1.isClassDeclaration(declaration)) {
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
                    if (typescript_1.isClassDeclaration(declaration)) {
                        collectInheritedMembers(declaration, members);
                    }
                }
            }
        }
        return typescript_1.createNodeArray(members);
    }
    function createToJsonMethodFor(classDeclaration) {
        const builder = new MethodBuilder_1.default()
            .addModifiers(typescript_1.createModifier(typescript_1.SyntaxKind.PublicKeyword))
            .addModifiers(typescript_1.createModifier(typescript_1.SyntaxKind.StaticKeyword))
            .setName(FROM_JSON_FN_NAME)
            .addParameter(FROM_JSON_ARG_NAME, typescript_1.createKeywordTypeNode(typescript_1.SyntaxKind.AnyKeyword))
            .setType(typescript_1.createTypeReferenceNode(classDeclaration.name, undefined))
            .updateBody(builder => builder.setMultiLine(true));
        if (!classDeclaration.members || classDeclaration.members.length === 0) {
            builder.updateBody(block => block.addStatement(createConstructAndReturn(classDeclaration)));
            return builder.build();
        }
        builder.updateBody(block => block.addStatement(createConstructStatement(classDeclaration)));
        const members = collectMembers(classDeclaration);
        for (const statement of members.map(createSerializerStatement)) {
            builder.updateBody(block => block.addStatement(statement));
        }
        builder.updateBody(block => block.addStatement(createReturnInstanceStatement()));
        return builder.build();
    }
    return function transform(context) {
        return function (rootNode) {
            function visit(node) {
                if (typescript_1.isImportDeclaration(node)) {
                    return updateImport(node);
                }
                if (typescript_1.isDecorator(node) && shouldRemoveDecorator(node)) {
                    return undefined;
                }
                if (typescript_1.isClassDeclaration(node)) {
                    const classElement = createToJsonMethodFor(node);
                    const clone = typescript_1.getMutableClone(node);
                    clone.members = ts.createNodeArray([...node.members, classElement]);
                    node = clone;
                }
                return ts.visitEachChild(node, (child) => visit(child), context);
            }
            return ts.visitNode(rootNode, visit);
        };
    };
}
exports.default = Transformer;
;
//# sourceMappingURL=Transformer.js.map