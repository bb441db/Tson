import {
    Block,
    ClassDeclaration,
    ClassElement, createArrowFunction,
    createFunctionDeclaration, createMethod,
    createModifier, createParameter,
    FunctionDeclaration, Identifier,
    Modifier,
    ParameterDeclaration,
    SyntaxKind, Type, TypeNode
} from "typescript";
import BlockBuilder from "./BlockBuilder";

class MethodBuilder {

    private modifiers: Modifier[] = [];
    private parameters: ParameterDeclaration[] = [];
    private name: string | Identifier;
    private block?: Block;
    private type?: TypeNode;

    addModifiers(...modifiers: Modifier[]): MethodBuilder {
        this.modifiers.push(...modifiers);
        return this;
    }

    addParameters(...parameters: ParameterDeclaration[]): MethodBuilder {
        this.parameters.push(...parameters);
        return this;
    }

    setName(name: string | Identifier): MethodBuilder {
        this.name = name;
        return this;
    }

    setType(type: TypeNode): MethodBuilder {
        this.type = type;
        return this;
    }

    setBody(block: Block): MethodBuilder {
        this.block = block;
        return this;
    }

    addParameter(name: string | Identifier, typeNode?: TypeNode): MethodBuilder {
        this.parameters.push(createParameter(undefined, undefined, undefined, name, undefined, typeNode));
        return this;
    }

    build(): ClassElement {
        return createMethod(
            undefined,
            this.modifiers,
            undefined, this.name,
            undefined,
            undefined,
            this.parameters,
            this.type,
            this.block,
        );
    }

}

export default MethodBuilder;
