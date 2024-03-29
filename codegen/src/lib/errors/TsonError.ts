import { Node } from 'typescript';
import * as path from 'path';

function createMessage(node: Node) {
    return `${node.getText()}\n^`;
}

function createStackLine(node: Node): string {
    const sourceFile = node.getSourceFile();
    let { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    return `${path.resolve(sourceFile.fileName)}:${line}:${character}\n${createMessage(node)}`;
}

export default class TsonError extends Error {

    private readonly node: Node;

    constructor(node: Node, message?: string) {
        super(null);
        this.node = node;
        Error.captureStackTrace(this, TsonError);
        this.name = 'TsonError';
        this.message = message;
        this.stack = `${createStackLine(node)}\n\n${this.stack}`;
    }

}
