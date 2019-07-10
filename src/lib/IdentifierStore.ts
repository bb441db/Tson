import {
    Node,
    createIdentifier,
    Identifier,
    TypeChecker, ClassDeclaration, SignatureDeclaration,
} from "typescript";

export default class IdentifierStore {

    private readonly checker: TypeChecker;
    private readonly node: Node;

    private identifiers: Identifier[] = [];
    private sourceFileIdentifiers: Identifier[] = [];

    constructor(checker: TypeChecker, node: ClassDeclaration) {
        this.checker = checker;
        this.node = node;
        const sourceFile = node.getSourceFile();
        const identifiers = sourceFile['identifiers'] as Map<string, string>;
        for (const key of identifiers.keys()) {
            this.sourceFileIdentifiers.push(createIdentifier(key));
        }
    }

    public createIdentifier(name: string): Identifier {
        const identifier = this.createUnusedIdentifier(name);
        this.identifiers.push(identifier);
        return identifier;
    }

    private createUnusedIdentifier(name: string, prefix?: string): Identifier {
        const identifierName = prefix == null ? name : `${prefix}${name}`;
        if ([...this.sourceFileIdentifiers, ...this.identifiers].findIndex(identifier => identifier.text === identifierName) > -1) {
            return this.createUnusedIdentifier(identifierName, '_');
        }
        return createIdentifier(identifierName);
    }

}
