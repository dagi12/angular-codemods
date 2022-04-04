import { Type } from "ast-types/lib/types";
import j, {
  ASTNode,
  ASTPath,
  Collection,
  Identifier,
  ImportSpecifier,
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

function insertAtTheBegining(s: any): void {
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

function safeImportInsert(
  specifier: ImportSpecifier[] | Identifier,
  sourcePath: string
) {
  const resSpecifier: ImportSpecifier[] = Array.isArray(specifier)
    ? specifier
    : [j.importSpecifier(specifier as Identifier)];

  if (
    !this.find(j.ImportSpecifier, {
      imported: { name: resSpecifier[0].imported.name },
    }).length
  ) {
    this.get().node.program.body.unshift(
      j.importDeclaration(resSpecifier, j.literal(sourcePath), "value")
    );
  }
}

export function renamePropertiesBy(map: { [_: string]: string }) {
  for (let [key, value] of Object.entries(map)) {
    this.find(j.Identifier, { name: key })
      .filter((p: any) => {
        return p.parent.value.type !== "ObjectProperty";
      })
      .replaceWith(j.identifier(value));
  }
}

export const collectionExt = {
  insertAtTheBegining,
  renamePropertyTo,
  directChildren,
  safeImportInsert,
  renamePropertiesBy,
};

export type MyCollection = Collection & typeof collectionExt;

declare module "jscodeshift/src/Collection" {
  interface Collection<N> {
    insertAtTheBegining: typeof insertAtTheBegining;
    renamePropertyTo: typeof renamePropertyTo;
    directChildren: typeof directChildren;
    safeImportInsert: typeof safeImportInsert;
    renamePropertiesBy: typeof renamePropertiesBy;
  }
}

export function myPlugin(jscodeshift: JSCodeshift) {
  jscodeshift.registerMethods(collectionExt);
}
