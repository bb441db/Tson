import {
    ClassDeclaration,
    ConstructorDeclaration, createModifier, isClassDeclaration,
    isConstructorDeclaration,
    ParameterDeclaration,
    Program, SyntaxKind
} from "typescript";

export default function (program: Program, classDeclaration: ClassDeclaration): ReadonlyArray<ParameterDeclaration> {

    const checker = program.getTypeChecker();

    function isPrivateConstructor(constructor: ConstructorDeclaration): boolean {
        return constructor.modifiers.includes(createModifier(SyntaxKind.PrivateKeyword));
    }

    function getFirstAccessibleConstructorDeclaration(node: ClassDeclaration, allowPrivate: boolean = true): ConstructorDeclaration | undefined {
        if (node.members && node.members.length > 0) {
            for (const member of node.members) {
                if (isConstructorDeclaration(member) && (allowPrivate || !isPrivateConstructor(member))) {
                    return member;
                }
            }
        }
        if (node.heritageClauses && node.heritageClauses.length > 0) {
            for (const heritageClause of node.heritageClauses) {
                for (const type of heritageClause.types) {
                    const declaration = checker.getTypeFromTypeNode(type).symbol.valueDeclaration;
                    if (isClassDeclaration(declaration)) {
                        const constructor = getFirstAccessibleConstructorDeclaration(declaration, false);
                        if (constructor != undefined) {
                            return constructor;
                        }
                    }
                }
            }
        }
        return undefined;
    }

    const constructor = getFirstAccessibleConstructorDeclaration(classDeclaration);

    return constructor ? constructor.parameters : [];
}
