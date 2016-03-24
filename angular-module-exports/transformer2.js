import { isAngularModuleDefinition } from '../angular-types'

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const {expression, statement, statements} = j.template;

  return j(file.source)
  .find(j.CallExpression, isAngularModuleDefinition)
  .replaceWith(p => {
    var parentCall = j(p).get().value;

    return j.callExpression(j.memberExpression(parentCall, j.identifier('directive')), [
      j.literal('test'),
      j.callExpression(j.identifier('require'), [j.literal('path')])
    ]);
  })
  .toSource({ wrapColumn: true });
};
