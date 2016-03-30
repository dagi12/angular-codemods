export default function transformer(file, api) {
  const j = api.jscodeshift;
  const {expression, statement, statements} = j.template;

  return j(file.source)
  .find(j.CallExpression, {
    callee: {
      object: {
        type: 'Identifier',
        name: 'ANGULAR_MODULES',
      },
      property: {
        type: 'Identifier',
        name: 'push',
      },
    },
    arguments: {
      length: 1,
    },
  })
  .replaceWith(p => {
    return j.assignmentExpression(
      '=',
      j.memberExpression(j.identifier('module'), j.identifier('exports')),
      p.value.arguments[0]
    );
  })
  .toSource();
};
