import {
    addSyntheticLeadingComment,
    createPrinter,
    createProgram,
    isClassDeclaration,
    ModuleKind,
    ScriptTarget,
    SourceFile,
    SyntaxKind,
    transform,
    TransformationResult,
} from 'typescript';
import {writeFileSync} from 'fs';
import Transformer from "./lib/Transformer";
import {basename} from "path";
import hasTsonDecoratedClassDeclaration from "./lib/utils/hasTsonDecoratedClassDeclaration";

const GENERATED_EXT = '.g';

const printer = createPrinter({removeComments: false});

function createComment(oldPath) {
    const lines = [
        '*** DO NOT EDIT! ***',
        `Generated deserializable class from: ${basename(oldPath)}.`,
    ];
    return `\n${lines.map(line => `\t${line}`).join('\n')}\n`
}

function main2() {
    const fileNames = process.argv.slice(2);
    const program = createProgram(fileNames, {
        target: ScriptTarget.ES5,
        module: ModuleKind.CommonJS
    });

    for (const sourceFile of program.getSourceFiles()) {
        if (!sourceFile.isDeclarationFile && hasTsonDecoratedClassDeclaration(sourceFile)) {
            const result: TransformationResult<SourceFile> = transform<SourceFile>(
                sourceFile, [Transformer(program)]
            );
            const newFileName = sourceFile.fileName.replace(/(.ts)$/, `${GENERATED_EXT}.ts`);
            const transformedSourceFile: SourceFile = result.transformed[0];
            for (const statement of transformedSourceFile.statements.filter(isClassDeclaration)) {
                addSyntheticLeadingComment(statement, SyntaxKind.MultiLineCommentTrivia, createComment(sourceFile.fileName), true);
            }
            const newContent = printer.printFile(transformedSourceFile);
            result.dispose();
            writeFileSync(newFileName, newContent);
        }
    }
}

main2();
