import {
    Block,
    ClassDeclaration,
    ClassElement, createArrowFunction,
    createFunctionDeclaration, createMethod,
    createModifier, createParameter,
    FunctionDeclaration,
    Modifier,
    ParameterDeclaration,
    SyntaxKind, Type, TypeNode
} from "typescript";
import BlockBuilder from "./BlockBuilder";

class MethodBuilder {

    private modifiers: Modifier[] = [];
    private parameters: ParameterDeclaration[] = [];
    private name: string;
    private blockBuilder: BlockBuilder = new BlockBuilder();
    private type?: TypeNode;

    addModifiers(...modifiers: Modifier[]): MethodBuilder {
        this.modifiers.push(...modifiers);
        return this;
    }

    addParameters(...parameters: ParameterDeclaration[]): MethodBuilder {
        this.parameters.push(...parameters);
        return this;
    }

    setName(name: string): MethodBuilder {
        this.name = name;
        return this;
    }

    setType(type: TypeNode): MethodBuilder {
        this.type = type;
        return this;
    }

    updateBody(callback: (builder: BlockBuilder) => BlockBuilder): MethodBuilder {
        this.blockBuilder = callback(this.blockBuilder);
        return this;
    }

    addParameter(name: string, typeNode?: TypeNode): MethodBuilder {
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
            this.blockBuilder.build()
        );
    }

}

export default MethodBuilder;
