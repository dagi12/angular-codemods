import j, {
  AssignmentExpression,
  ASTPath,
  BlockStatement,
  ClassProperty,
  Collection,
  ExpressionStatement,
  FunctionDeclaration,
  Statement,
} from "jscodeshift";
import { createArrowFunctionExpression2 } from "./build-util";
import "./collection-ext";
import { isDirectChildOf, isSingle } from "./search-util";

export function fromDeclaration(
  toClassArrow: FunctionDeclaration
): ClassProperty {
  const arrowFunc = j.arrowFunctionExpression(
    toClassArrow.params,
    toClassArrow.body,
    false
  );
  arrowFunc.returnType = toClassArrow.returnType;
  arrowFunc.defaults = toClassArrow.defaults;
  arrowFunc.rest = toClassArrow.rest;
  arrowFunc.async = toClassArrow.async;

  return j.classProperty(
    j.identifier(toClassArrow.id.name),
    arrowFunc,
    null,
    false
  );
}

export function fromFunExpr(toClassArrow: any): ClassProperty {
  const expr = toClassArrow.expression;
  return j.classProperty(
    j.identifier(expr.left.property.name),
    createArrowFunctionExpression2(expr.right as any),
    null,
    false
  );
}

export function fromAssignmentArrow(toClassArrow: any): ClassProperty {
  const expr = toClassArrow.expression;
  return j.classProperty(
    j.identifier(expr.left.property.name),
    createArrowFunctionExpression2(expr.right as any),
    null,
    false
  );
}

export function convertToClassProperties(
  funDecs: ASTPath<FunctionDeclaration>[],
  funExprs: ASTPath<AssignmentExpression>[],
  arrExprs: ASTPath<AssignmentExpression>[]
): ClassProperty[] {
  return [
    ...funDecs.map((a) => fromDeclaration(a.node)),
    ...funExprs.map((a) => fromFunExpr(a.node)),
    ...arrExprs.map((a) => fromAssignmentArrow(a.node)),
  ];
}

export function blockFnExpressions(
  parentCollection: Collection<BlockStatement>
): {
  [_: string]: ASTPath<any>[];
} {
  const funDeclars: ASTPath[] = [];
  const memberFunExprs: ASTPath[] = [];
  const memberArrowFunExprs: ASTPath[] = [];

  parentCollection
    .map((parentPath: ASTPath<any>) => {
      const decs = j(parentPath).find(j.FunctionDeclaration);
      const exprs = j(parentPath).find(j.ExpressionStatement);
      const pathArr: ASTPath<any>[] = [
        ...decs
          .filter((p) => {
            return p.parentPath == parentPath;
          })
          .paths(),
        ...exprs
          .filter((p) => {
            return p.parentPath.node === parentPath.node;
          })
          .paths(),
      ];
      return pathArr;
    })
    .forEach((path) => {
      const node = path.node as ExpressionStatement;
      switch (node.type) {
        case j.FunctionDeclaration.toString():
          funDeclars.push(path);
          break;
        case j.ExpressionStatement.toString(): {
          const expr = node.expression as AssignmentExpression;
          if (expr && expr.right) {
            if (expr.right.type === j.FunctionExpression.toString()) {
              memberFunExprs.push(path);
            } else if (
              expr.right.type === j.ArrowFunctionExpression.toString()
            ) {
              memberArrowFunExprs.push(path);
            }
          }
        }
      }
    });

  return { funDeclars, memberFunExprs, memberArrowFunExprs };
}

export function nonFunExpressionsInBlock(
  fnBlockNodeCollection: Collection<BlockStatement>
): Statement[] {
  const linkFunBlockFunExprs = blockFnExpressions(fnBlockNodeCollection);

  const linkFunBlockFunNodes = Object.values(linkFunBlockFunExprs)
    .flat(2)
    .map((v) => v.node);

  return fnBlockNodeCollection
    .find(j.Statement)
    .filter((p) => isDirectChildOf(fnBlockNodeCollection, p))
    .filter((p: ASTPath<ExpressionStatement>) => {
      return !linkFunBlockFunNodes.includes(p.node);
    })
    .nodes();
}

export function groupFunctionContent(inputFn: Collection) {
  let methods: ClassProperty[] = [];
  let statements: Statement[] = [];
  if (isSingle(inputFn)) {
    const fnBlock = inputFn.find(j.BlockStatement).at(0);
    const funExprs = blockFnExpressions(fnBlock);
    statements = nonFunExpressionsInBlock(fnBlock);
    methods = convertToClassProperties(
      funExprs.funDeclars,
      funExprs.memberFunExprs,
      funExprs.memberArrowFunExprs
    );
  }
  return { methods, statements };
}
