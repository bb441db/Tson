import {
    createLiteral, Expression,
    Identifier,
    isCallOrNewExpression,
    isFunctionLike,
    isIdentifier,
    isObjectLiteralExpression,
    isPropertyAssignment,
    isStringLiteral,
    ParameterDeclaration,
    PropertyDeclaration,
    TypeChecker
} from "typescript";

export interface TsonPropData {
    name: Expression;
    converter: Expression | null;
}

export default function (checker: TypeChecker) {
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
    return {
        getTsonPropData
    }
}
