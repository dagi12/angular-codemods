import { isAngularModuleDefinition } from '../angular-types'

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const {expression, statement, statements} = j.template;

  function angularDependencyDefinition(parentCall, { type, name, path }) {
    return j.callExpression(j.memberExpression(parentCall, j.identifier(type)), [
      j.literal(name),
      j.callExpression(j.identifier('require'), [j.literal(path)]),
    ]);
  }

  function angularDependencyDefinitions(parentCall, [definition, ...rest]) {
    if (!definition) {
      return parentCall;
    }

    return angularDependencyDefinitions(angularDependencyDefinition(parentCall, definition), rest);
  }

  return j(file.source)
  .find(j.CallExpression, isAngularModuleDefinition)
  .replaceWith(p => {
    const parentCall = j(p).get().value;
    const definitions = [
      { module: 'test_module', type: 'directive', name: 'test_directive', path: '/test/directive.js' },
      { module: 'test_module', type: 'factory', name: 'test_factory', path: '/test/factory.js' },
    ];

    return angularDependencyDefinitions(parentCall, definitions);
  })
  .toSource({ wrapColumn: true });
};
