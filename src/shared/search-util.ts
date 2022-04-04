import { ExpressionKind } from "ast-types/gen/kinds";
import { Type } from "ast-types/lib/types";
import jscodeshift, {
  ASTNode,
  ASTPath,
  BlockStatement,
  Collection,
  FileInfo,
  FunctionExpression,
  JSCodeshift,
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

export const initialConditions = (
  fileInfo: FileInfo,
  root: Collection,
  transformed: Collection,
  initialNode: Collection
) => {
  if (transformed.length) {
    console.log("Already transformed");
    return {};
  }
  const mainPath = initialNode.at(-1);
  assertOne(mainPath, "Initial node not found");

  const beginLn = fileInfo.source.split(/\r\n|\r|\n/).length;
  const beginCount = root.find(jscodeshift.Statement).length;

  return { mainPath, beginLn, beginCount };
};

export function assertOne(c: Collection | any[], msg = "\n PUSTA KOLEKCJA \n") {
  if (!c) {
    throw new Error("NULL POINTER\n");
  } else if (c.length === 0) {
    throw new Error(msg);
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

export function assertCodeSize(
  beforeCount: number,
  beforeLn: number,
  j: JSCodeshift,
  root: Collection,
  options: any
) {
  // programing mode
  if (
    options.dry &&
    options.failOnError &&
    options.print ** options.verbose === 1
  ) {
    return;
  }
  const endCount = root.find(j.Statement).length;
  const endSrc = root.toSource();
  const endLn = endSrc.split(/\r\n|\r|\n/).length;
  if (!beforeCount || !endCount) {
    console.error(endSrc);
    throw new Error("Plik bez ekspresji");
  } else if (beforeCount - 15 > endCount) {
    console.error(endSrc);
    throw new Error(`Zgubiono expression przed ${beforeCount} po: ${endCount}`);
  }
  if (!beforeLn || !endLn) {
    console.error(endSrc);
    throw new Error("Plik bez ekspresji");
  } else if (beforeLn - 15 > endLn) {
    console.error(endSrc);
    throw new Error(`Zgubionono linie przed ${beforeLn} po: ${endLn}`);
  }
}

export function pushUnique<T>(arr: T[], elem: T) {
  if (!arr.includes(elem)) {
    arr.push(elem);
  }
  return arr;
}

export function reassignForBuilder<T extends ASTNode>(
  root: Collection,
  results: object,
  type: Type<T>,
  propArr: string[]
) {
  propArr.forEach((s) => {
    const c = root.find(type, {
      key: { name: s },
    } as any);
    results[s] = c && c.length ? c.nodes() : [];
  });
}

export function deepClone<T>(clone: T) {
  return JSON.parse(JSON.stringify(clone));
}
