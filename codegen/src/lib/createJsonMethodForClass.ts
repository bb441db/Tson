import {
    ClassDeclaration,
    ClassElement,
    createKeywordTypeNode,
    createModifier,
    createTypeReferenceNode,
    createUniqueName,
    Program,
    SyntaxKind,
} from "typescript";
import MethodBuilder from "./builders/MethodBuilder";
import createConvertFunctionBodyForType from "./createConvertFunctionBody";
import {FROM_JSON_ARG_NAME, FROM_JSON_FN_NAME} from "./constants";


export default function (program: Program, node: ClassDeclaration) {
    const jsonFunctionIdentifier = createUniqueName(FROM_JSON_FN_NAME);
    if (jsonFunctionIdentifier.text !== FROM_JSON_FN_NAME) {
        throw Error(`Cannot create unique identifier '${FROM_JSON_FN_NAME}'`);
    }
    const jsonArgumentIdentifier = createUniqueName(FROM_JSON_ARG_NAME);
    const type = program.getTypeChecker().getTypeAtLocation(node);
    function createToJsonMethodFor(classDeclaration: ClassDeclaration): ClassElement {
        const builder = new MethodBuilder()
            .addModifiers(createModifier(SyntaxKind.PublicKeyword))
            .addModifiers(createModifier(SyntaxKind.StaticKeyword))
            .setName(FROM_JSON_FN_NAME)
            .addParameter(jsonArgumentIdentifier, createKeywordTypeNode(SyntaxKind.AnyKeyword))
            .setType(createTypeReferenceNode(classDeclaration.name, undefined))
            .setBody(createConvertFunctionBodyForType(program, type, jsonArgumentIdentifier));
        return builder.build();
    }
    return createToJsonMethodFor(node);
}
