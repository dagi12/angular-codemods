import fs from "fs";
import path from "path";
import { isAngularDependencyDefinition } from "../angular-types";
import { serializeDependency } from "../shared/files.js";

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const { expression, statement, statements } = j.template;
  const depTmp = path.resolve(__dirname, "..", "tmp/dependencies");

  function parseDefinition({ expression: e }) {
    const module = e.callee.object.arguments[0].value;
    const type = e.callee.property.name;
    const name = e.arguments[0].value;
    const definition = e.arguments[1];

    return { module, type, name, definition };
  }

  function saveDependencyDefinition(p) {
    const { module, type, name } = parseDefinition(p.value);

    const dependency = serializeDependency({
      module,
      type,
      name,
      path: path.resolve(file.path),
    });
    fs.appendFile(depTmp, dependency + "\n", (err) => {
      if (err) throw err;
    });
  }

  function toExport(p) {
    const { definition } = parseDefinition(p.value);

    j(p).replaceWith(
      j.expressionStatement(
        j.assignmentExpression(
          "=",
          j.memberExpression(j.identifier("module"), j.identifier("exports")),
          definition
          //j.functionExpression(null, definition.params, definition.body)
        )
      )
    );
  }

  return j(file.source)
    .find(j.ExpressionStatement, {
      expression: isAngularDependencyDefinition,
    })
    .forEach(saveDependencyDefinition)
    .forEach(toExport)
    .toSource();
}
