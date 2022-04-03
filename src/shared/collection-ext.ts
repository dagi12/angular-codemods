import j, { ASTNode, ASTPath, Collection } from "jscodeshift";

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

function renamePropertyTo(path: Collection, name: string) {
  return path.replaceWith((path: ASTPath) => {
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

export const collectionExt = {
  insertAtTheBegining,
  renamePropertyTo,
};

export type MyCollection = Collection & typeof collectionExt;
