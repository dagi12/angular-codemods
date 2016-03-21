import { isAngularDependencyDefinition } from '../angular-types'

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const {expression, statement, statements} = j.template;

  function parseDefinition({expression: e}) {
    const module = e.callee.object.arguments[0].value;
    const type = e.callee.property.name;
    const name = e.arguments[0].value;
    const definition = e.arguments[1];

    return { module, type, name, definition  };
  }

  function saveDependencyDefinition(p) {
    const { module, type, name  } = parseDefinition(p.value);
    const definition = {
      [module]: {
        [type]: {
          [name]: file.path
        }
      }
    };

    var currentFile = {};

    if (!currentFile[module]) {
      currentFile[module] = {};
    }
    if (!currentFile[module][type]) {
      currentFile[module][type] = {};
    }

    currentFile[module][type][name] = file.path;
  }

  function toExport(p) {
    const { definition  } = parseDefinition(p.value);
    console.log(definition);
    j(p).replaceWith(j.expressionStatement(j.assignmentExpression(
      '=',
      j.memberExpression(j.identifier('module'), j.identifier('exports')),
      j.functionExpression(null, definition.params, definition.body)
    )));
  }

  return j(file.source)
  .find(j.ExpressionStatement, {
    expression: isAngularDependencyDefinition 
  })
  .forEach(saveDependencyDefinition)
  .forEach(toExport)
  .toSource();
};
