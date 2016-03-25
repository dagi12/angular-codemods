import path from 'path';
import fs from 'fs';
import { isAngularModuleDefinition } from '../angular-types';
import { loadData, flattenTree } from '../helpers/files';

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

  const filePath = path.resolve(__dirname, '../tmp/dependencies');
  const dependenciesFile = fs.readFileSync(filePath, { encoding: 'utf8' });
  const tree = loadData(dependenciesFile);
  const definitions = flattenTree(tree);
  return j(file.source)
  .find(j.CallExpression, isAngularModuleDefinition)
  .replaceWith(p => {
    const parentCall = j(p).get().value;

    return angularDependencyDefinitions(parentCall, definitions);
  })
  .toSource({ wrapColumn: true });
};
