import {
    ConciseBody,
    createKeywordTypeNode,
    createLiteral,
    Decorator,
    Expression,
    FunctionBody,
    Identifier,
    isArrowFunction,
    isBlock,
    isCallOrNewExpression,
    isFunctionExpression,
    isFunctionLike,
    isIdentifier,
    isObjectLiteralExpression,
    isPropertyAssignment,
    isReturnStatement,
    isStringLiteral,
    ObjectLiteralExpression,
    ParameterDeclaration,
    PropertyDeclaration,
    SignatureDeclaration,
    SyntaxKind,
    Type,
    TypeChecker
} from "typescript";

export interface TsonPropData {
    name: Expression;
    converter: Expression | null;
}

const TsonProp = 'TsonProp';

export default function (checker: TypeChecker) {

    function getTsonPropDecorator(member: PropertyDeclaration | ParameterDeclaration): Decorator | undefined {
        if (member.decorators && member.decorators.length > 0) {
            for (const decorator of member.decorators) {
                if (isCallOrNewExpression(decorator.expression)
                    && isIdentifier(decorator.expression.expression)
                    && decorator.expression.expression.text === TsonProp) {
                    return decorator;
                }
            }
        }
        return undefined;
    }

    function getFirstDecoratorArgument(decorator: Decorator): Expression | undefined {
        if (isCallOrNewExpression(decorator.expression) && decorator.expression.arguments) {
            if (decorator.expression.arguments && decorator.expression.arguments.length > 0) {
                return decorator.expression.arguments[0];
            }
        }
        return undefined;
    }

    function isValidNameExpression(expression: Expression): boolean {
        if (isStringLiteral(expression)) {
            return true;
        }
        if (isIdentifier(expression)) {
            const type = checker.getTypeAtLocation(expression);
            return type.isStringLiteral();
        }
        return false;
    }

    function getTypeFromFunctionBody(body: FunctionBody | ConciseBody): Type {
        if (isBlock(body)) {
            const returnStatement = body.statements.find(isReturnStatement);
            if (returnStatement != null) {
                return checker.getTypeAtLocation(returnStatement.expression);
            }
        } else {
            return checker.getTypeAtLocation(body);
        }
        return checker.getTypeFromTypeNode(createKeywordTypeNode(SyntaxKind.AnyKeyword));
    }

    function getTypeFromSignatureDeclaration(signatureDeclaration: SignatureDeclaration): Type {
        if (isArrowFunction(signatureDeclaration)) {
            return getTypeFromFunctionBody(signatureDeclaration.body);
        } else if (isFunctionExpression(signatureDeclaration)) {
            return getTypeFromFunctionBody(signatureDeclaration);
        }
        return checker.getTypeFromTypeNode(createKeywordTypeNode(SyntaxKind.AnyKeyword));
    }

    function ensureCorrectReturnType(member: PropertyDeclaration | ParameterDeclaration, functionLike: SignatureDeclaration): boolean {
        const memberType = checker.typeToString(checker.getTypeFromTypeNode(member.type));
        const functionType = checker.typeToString(functionLike.type ? checker.getTypeFromTypeNode(functionLike.type) : getTypeFromSignatureDeclaration(functionLike));
        if (memberType !== functionType) {
            throw new Error(`(${functionLike.getText()}) Invalid converter function return type, expecting: ${memberType} got ${functionType}`)
        }
        return true;
    }

    function isValidConverterFunction(member: PropertyDeclaration | ParameterDeclaration, expression: Expression): boolean {
        if (isFunctionLike(expression) && ensureCorrectReturnType(member, expression)) {
            return true;
        }
        if (isIdentifier(expression)) {
            const type = checker.getTypeAtLocation(expression);
            if (isFunctionLike(type.symbol.valueDeclaration) && ensureCorrectReturnType(member, type.symbol.valueDeclaration)) {
                return true;
            }
        }
        return false;
    }

    function getNameFromObjectLiteralExpression(expression: ObjectLiteralExpression): Expression | undefined {
        if (expression.properties && expression.properties.length > 0) {
            for (const property of expression.properties) {
                if (isPropertyAssignment(property) && isIdentifier(property.name) && property.name.text === 'name') {
                    if (isValidNameExpression(property.initializer)) {
                        return property.initializer
                    }
                }
            }
        }
        return undefined;
    }

    function getFunctionFromObjectLiteralExpression(member: PropertyDeclaration | ParameterDeclaration, expression: ObjectLiteralExpression): Expression | undefined {
        if (expression.properties && expression.properties.length > 0) {
            for (const property of expression.properties) {
                if (isPropertyAssignment(property) && isIdentifier(property.name) && property.name.text === 'converter') {
                    if (isValidConverterFunction(member, property.initializer)) {
                        return property.initializer
                    }
                }
            }
        }
        return undefined;
    }

    function getTsonPropData(member: PropertyDeclaration | ParameterDeclaration): TsonPropData {
        const data: TsonPropData = {
            name: createLiteral((member.name as Identifier).text),
            converter: null,
        };
        const decorator = getTsonPropDecorator(member);
        if (decorator != null) {
            const argument = getFirstDecoratorArgument(decorator);
            if (isObjectLiteralExpression(argument)) {
                const name = getNameFromObjectLiteralExpression(argument);
                if (name != undefined) {
                    data.name = name;
                }
                const converter = getFunctionFromObjectLiteralExpression(member, argument);
                if (converter != undefined) {
                    data.converter = converter;
                }
            } else if (isValidNameExpression(argument)) {
                data.name = argument;
            } else if (isValidConverterFunction(member, argument)) {
                data.converter = argument;
            }
        }
        return data;
    }
    return {
        getTsonPropData
    }
}
