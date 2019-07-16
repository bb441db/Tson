import {
    Identifier,
    InterfaceDeclaration,
    isInterfaceDeclaration,
    isPropertySignature,
    Program,
    PropertySignature
} from "typescript";

export default function *collectionInterfaceDeclarationProperties(program: Program, interfaceDeclaration: InterfaceDeclaration): IterableIterator<PropertySignature> {
    const checker = program.getTypeChecker();
    function *collectInheritedMembers(inheritedInterfaceDeclaration: InterfaceDeclaration, members: PropertySignature[]) {
        const accessibleMembers = inheritedInterfaceDeclaration.members
            .filter(member => members.findIndex(m => (m.name as Identifier).text === (member.name as Identifier).text) === -1);
        for (const member of accessibleMembers) {
            if (isPropertySignature(member)) {
                members.push(member);
                yield member;
            }
        }
        if (inheritedInterfaceDeclaration.heritageClauses && inheritedInterfaceDeclaration.heritageClauses.length > 0) {
            for (const hc of inheritedInterfaceDeclaration.heritageClauses.filter(hc => hc.types && hc.types.length > 0)) {
                for (const hct of hc.types) {
                    const declaration = checker.getTypeFromTypeNode(hct).symbol.valueDeclaration;
                    if (isInterfaceDeclaration(declaration)) {
                        yield collectInheritedMembers(declaration, members);
                    }
                }
            }
        }
    }
    const properties = [];
    for (const member of interfaceDeclaration.members) {
        if (isPropertySignature(member)) {
            properties.push(member);
            yield member;
        }
    }
    if (interfaceDeclaration.heritageClauses && interfaceDeclaration.heritageClauses.length > 0) {
        for (const hc of interfaceDeclaration.heritageClauses.filter(hc => hc.types && hc.types.length > 0)) {
            for (const hct of hc.types) {
                const declaration = checker.getTypeFromTypeNode(hct).symbol.valueDeclaration;
                if (isInterfaceDeclaration(declaration)) {
                    yield collectInheritedMembers(declaration, properties);
                }
            }
        }
    }
}
