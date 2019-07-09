"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = require("typescript");
const fs_1 = require("fs");
const Transformer_1 = require("./lib/Transformer");
const path_1 = require("path");
const hasTsonDecoratedClassDeclaration_1 = require("./lib/utils/hasTsonDecoratedClassDeclaration");
const GENERATED_EXT = '.g';
const printer = typescript_1.createPrinter({ removeComments: false });
function createComment(oldPath) {
    const lines = [
        '*** DO NOT EDIT! ***',
        `Generated deserializable class from: ${path_1.basename(oldPath)}.`,
    ];
    return `\n${lines.map(line => `\t${line}`).join('\n')}\n`;
}
function main2() {
    const fileNames = process.argv.slice(2);
    const program = typescript_1.createProgram(fileNames, {
        target: typescript_1.ScriptTarget.ES5,
        module: typescript_1.ModuleKind.CommonJS
    });
    for (const sourceFile of program.getSourceFiles()) {
        if (!sourceFile.isDeclarationFile && hasTsonDecoratedClassDeclaration_1.default(sourceFile)) {
            const result = typescript_1.transform(sourceFile, [Transformer_1.default(program)]);
            const newFileName = sourceFile.fileName.replace(/(.ts)$/, `${GENERATED_EXT}.ts`);
            const transformedSourceFile = result.transformed[0];
            for (const statement of transformedSourceFile.statements.filter(typescript_1.isClassDeclaration)) {
                typescript_1.addSyntheticLeadingComment(statement, typescript_1.SyntaxKind.MultiLineCommentTrivia, createComment(sourceFile.fileName), true);
            }
            const newContent = printer.printFile(transformedSourceFile);
            result.dispose();
            fs_1.writeFileSync(newFileName, newContent);
        }
    }
}
main2();
//# sourceMappingURL=cli.js.map