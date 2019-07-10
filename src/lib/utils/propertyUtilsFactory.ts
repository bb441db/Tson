import {
    ClassDeclaration,
    ClassElement,
    ConstructorDeclaration, createNodeArray,
    Identifier, isClassDeclaration,
    isConstructorDeclaration, isDecorator, isIdentifier, isParameter,
    isPropertyDeclaration, NodeArray, ParameterDeclaration, SyntaxKind, TypeChecker
} from "typescript";

export default function (checker: TypeChecker) {

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
    return {
        collectMembers, collectConstructorParameters
    }
}
