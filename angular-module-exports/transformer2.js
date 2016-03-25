import path from 'path';
import fs from 'fs';
import { isAngularModuleDefinition } from '../angular-types';
import { loadData, flattenTree, serializeDependency } from '../helpers/files';

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const {expression, statement, statements} = j.template;

  const filePath = path.resolve(__dirname, '../tmp/dependencies');
  const dependenciesFile = fs.readFileSync(filePath, { encoding: 'utf8' });
  const tree = loadData(dependenciesFile);
  let definitions = flattenTree(tree);

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

    definitions = definitions.filter(d => d !== definition);

    return angularDependencyDefinitions(angularDependencyDefinition(parentCall, definition), rest);
  }

  const result = j(file.source)
  .find(j.CallExpression, isAngularModuleDefinition)
  .replaceWith(p => {
    const parentCall = j(p).get().value;
    const module = p.value.arguments[0].value;

    return angularDependencyDefinitions(parentCall, definitions.filter(d => d.module === module));
  })
  .toSource({ wrapColumn: true });

  const serializedDependencies = '' + definitions.map(serializeDependency).join('\n');
  fs.writeFileSync(filePath, serializedDependencies);

  return result;

};
