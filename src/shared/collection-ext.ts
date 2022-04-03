import { hasImportDeclaration, insertImportSpecifier } from "@codeshift/utils";
import { Type } from "ast-types/lib/types";
import j, {
  ASTNode,
  ASTPath,
  Collection,
  Identifier,
  JSCodeshift,
} from "jscodeshift";

export function update(node: ASTNode, name: string) {
  switch (node.type) {
    case "Identifier":
      node.name = name;
      break;
    case "Literal":
      node.value = name;
      break;
    default:
  }
}

function insertAtTheBegining(s: string): void {
  return this.get().node.program.body.unshift(s);
}

function renamePropertyTo(name: string) {
  return this.replaceWith((path: ASTPath) => {
    const node: any = path.node;
    const parentPath: any = path.parent;

    const parentNode = parentPath.value;

    // exports.a
    if (
      j.MemberExpression.check(parentPath.value) &&
      parentNode.property.name === node.name
    ) {
      update(node, name);
    }

    // { a: 1 }
    if (
      j.Property.check(parentPath.value) &&
      parentNode.key.value === node.value
    ) {
      update(node, name);
    }

    return node;
  });
}

function directChildren<T>(ofType: Type<T>): Collection<T> {
  return this.find(ofType).map((parentPath: ASTPath) => {
    return j(parentPath)
      .find(j.Property)
      .filter((p) => p.parentPath.node == parentPath.node)
      .paths();
  });
}

function safeImportInsert(id: Identifier, sourcePath: string) {
  if (!hasImportDeclaration(j, this, sourcePath)) {
    insertImportSpecifier(j, this, j.importSpecifier(id), sourcePath);
  }
}

export const collectionExt = {
  insertAtTheBegining,
  renamePropertyTo,
  directChildren,
  safeImportInsert,
};

export type MyCollection = Collection & typeof collectionExt;

declare module "jscodeshift/src/Collection" {
  interface Collection<N> {
    insertAtTheBegining: typeof insertAtTheBegining;
    renamePropertyTo: typeof renamePropertyTo;
    directChildren: typeof directChildren;
    safeImportInsert: typeof safeImportInsert;
  }
}

export function myPlugin(jscodeshift: JSCodeshift) {
  jscodeshift.registerMethods(collectionExt);
}
