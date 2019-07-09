import {Block, createBlock, Statement} from "typescript";

export default class BlockBuilder {

    private readonly statements: Statement[] = [];
    private multiline: boolean = true;


    public addStatement(statement: Statement): BlockBuilder {
        this.statements.push(statement);
        return this;
    }

    public setMultiLine(bool: boolean): BlockBuilder {
        this.multiline = bool;
        return this;
    }

    public build(): Block {
        return createBlock(this.statements, this.multiline);
    }
}
