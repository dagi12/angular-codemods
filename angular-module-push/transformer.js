import path from 'path';
import fs from 'fs';

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
    const destination = path.resolve('test', 'modules.js');

    var previous;
    try {
      previous = fs.readFileSync(destination, { flags: 'a+', encoding: 'utf8' });
    } catch (e) {
      previous = 'module.exports = [\n];';
    }
    const breakdown = previous.split('\n');
    const require = `require('${path.resolve(file.path)}'),`
    const nextBreakdown = breakdown.slice(0, -1).concat(require, breakdown.slice(-1));
    console.log(nextBreakdown);

    try {
      fs.writeFileSync(destination, nextBreakdown.join('\n'));
    } catch (e) {
      console.error(e);
    }

    return j.assignmentExpression(
      '=',
      j.memberExpression(j.identifier('module'), j.identifier('exports')),
      p.value.arguments[0]
    );
  })
  .toSource();
};
