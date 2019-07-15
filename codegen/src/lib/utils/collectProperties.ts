import {
    ClassDeclaration,
    ClassElement, ConstructorDeclaration, createNodeArray,
    Identifier, isClassDeclaration, isConstructorDeclaration,
    isDecorator,
    isIdentifier, isParameter,
    isPropertyDeclaration, NodeArray, ParameterDeclaration, Program, PropertyDeclaration,
    SyntaxKind
} from "typescript";

function hasTsonIgnoreDecorator(member: PropertyDeclaration): boolean {
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

function hasStaticKeyword(member: PropertyDeclaration): boolean {
    return member.modifiers.map(mod => mod.kind).includes(SyntaxKind.StaticKeyword);
}

function hasReadonlyKeyword(member: PropertyDeclaration): boolean {
    return member.modifiers.map(mod => mod.kind).includes(SyntaxKind.ReadonlyKeyword);
}

function hasPrivateKeyword(member: PropertyDeclaration): boolean {
    return member.modifiers.map(mod => mod.kind).includes(SyntaxKind.PrivateKeyword);
}
function isSerializableInheritedProperty(member: ClassElement, members: PropertyDeclaration[]): boolean {
    return isSerializableProperty(member)
        && isPropertyDeclaration(member)
        && !hasPrivateKeyword(member)
        && members.findIndex(m => (m.name as Identifier).text === (member.name as Identifier).text) === -1;
}

function isSerializableProperty(member: ClassElement): member is PropertyDeclaration {
    return isPropertyDeclaration(member) && !hasReadonlyKeyword(member) && !hasStaticKeyword(member) && !hasTsonIgnoreDecorator(member);
}

export default function collectProperties(program: Program, classDeclaration: ClassDeclaration): PropertyDeclaration[] {
    const checker = program.getTypeChecker();
    function collectInheritedMembers(inheritedClassDeclaration: ClassDeclaration, members: PropertyDeclaration[]) {
        const accessibleMembers = inheritedClassDeclaration.members.filter(member => isSerializableInheritedProperty(member, members));
        for (const member of accessibleMembers) {
            if (isPropertyDeclaration(member)) {
                members.push(member);
            }
        }
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
    const properties = [];
    for (const member of classDeclaration.members.filter(isSerializableProperty)) {
        if (isPropertyDeclaration(member)) {
            properties.push(member);
        }
    }
    if (classDeclaration.heritageClauses && classDeclaration.heritageClauses.length > 0) {
        for (const hc of classDeclaration.heritageClauses.filter(hc => hc.types && hc.types.length > 0)) {
            for (const hct of hc.types) {
                const declaration = checker.getTypeFromTypeNode(hct).symbol.valueDeclaration;
                if (isClassDeclaration(declaration)) {
                    collectInheritedMembers(declaration, properties);
                }
            }
        }
    }
    return properties;
}
