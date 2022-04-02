import { ExpressionKind } from "ast-types/gen/kinds";
import {
  ASTPath,
  BlockStatement,
  Collection,
  FunctionExpression,
} from "jscodeshift";

export function isDirectChildOf(
  parentCollection: Collection,
  child: ASTPath<any>
) {
  let current = child.parentPath;
  // Ignoring object expressions
  while (current.node && current.node.type === "ObjectExpression") {
    current = current.parentPath;
  }

  return current.node === parentCollection.get(0).node;
}

export function searchDepth(
  parentCollection: Collection,
  child: ASTPath<any>,
  depth: number
) {
  let current = child.parentPath;
  // Ignoring object expressions
  while (current.node && current.node.type === "ObjectExpression") {
    current = current.parentPath;
  }

  return current.node === parentCollection.get(0).node;
}

export const findStatementBody = (
  fn: FunctionExpression
): BlockStatement | ExpressionKind => {
  // 79 characters fit on a line of length 80

  if (fn.body.type == "BlockStatement" && fn.body.body.length == 1) {
    const inner = fn.body.body[0];
    const comments = (fn.body.comments || []).concat(inner.comments || []);

    if (inner.type == "ExpressionStatement") {
      inner.expression.comments = (inner.expression.comments || []).concat(
        comments
      );
      return inner.expression;
    } else if (inner.type == "ReturnStatement") {
      if (inner.argument === null) {
        // The rare case of a function with a lone return statement.
        fn.body.body = [];
        return fn.body;
      }

      inner.argument.comments = (inner.argument.comments || []).concat(
        comments
      );
      return inner.argument;
    }
  }
  return fn.body;
};

export function assertOne(c: Collection | any[]) {
  if (!c) {
    throw new Error("NULL POINTER\n");
  } else if (c.length === 0) {
    throw new Error("\n PUSTA KOLEKCJA \n");
  } else if (c.length > 1) {
    throw new Error("\n WIĘCEJ NIŻ 1 ELEMENT \n");
  }
}

export function isSingle(c: Collection | any[]) {
  if (!c) {
    console.info("NULL POINTER\n");
    return false;
  } else if (c.length === 0) {
    console.info("\n PUSTA KOLEKCJA \n");
    return false;
  } else if (c.length > 1) {
    console.info("\n WIĘCEJ NIŻ 1 ELEMENT \n");
    return false;
  }
  return true;
}
