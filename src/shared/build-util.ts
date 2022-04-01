import j, { ArrowFunctionExpression, FunctionExpression } from "jscodeshift";
import { findStatementBody } from "./search-util";

export function createArrowFunctionExpression(
  fn: FunctionExpression
): ArrowFunctionExpression {
  const arrowFunction = j.arrowFunctionExpression(
    fn.params,
    findStatementBody(fn),
    false
  );
  arrowFunction.comments = fn.comments;
  arrowFunction.async = fn.async;
  return arrowFunction;
}

export const createArrowFunctionExpression2 = (
  fn: FunctionExpression
): ArrowFunctionExpression => {
  const arrowFunc = j.arrowFunctionExpression(fn.params, fn.body, false);

  arrowFunc.returnType = fn.returnType;
  arrowFunc.defaults = fn.defaults;
  arrowFunc.rest = fn.rest;
  arrowFunc.async = fn.async;

  return arrowFunc;
};
