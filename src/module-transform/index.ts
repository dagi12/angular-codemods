import {
  API,
  ArrayExpression,
  FileInfo,
  Identifier,
  Literal,
  ObjectProperty,
} from "jscodeshift";
import { collectionExt, MyCollection } from "../shared/collection-ext";

export default function transformer(fileInfo: FileInfo, api: API) {
  const j = api.jscodeshift;

  j.registerMethods(collectionExt);

  const root = j(fileInfo.source) as MyCollection;

  root.insertAtTheBegining("import { NgModule } from 'angular-ts-decorators';");

  const routeConfig = root.find(j.FunctionDeclaration, {
    id: { name: "routeConfig" },
  });

  if (routeConfig.length) {
    root.insertAtTheBegining(
      "import { StateProvider } from '@uirouter/angularjs';"
    );
  }

  const rootExports = root.find(j.ExportNamedDeclaration);

  const moduleC = rootExports
    .find(j.VariableDeclaration, {
      kind: "const",
    })
    .at(0);

  const decs = {
    id: null as Literal,
    imports: null as ArrayExpression,
    declarations: [] as Identifier[],
    providers: [] as Identifier[],
  };

  moduleC
    .find(j.CallExpression, {
      callee: {
        type: "MemberExpression",
        property: {
          type: "Identifier",
        },
      },
    })
    .filter((p) => {
      return p.parent.node.type === j.MemberExpression.toString();
    })
    .forEach((p: any) => {
      const ids = p.node.arguments[1];
      const depType = p.node.callee.property.name;
      switch (depType) {
        case "directive":
        case "component":
          {
            decs.declarations.push(ids);
          }
          break;
        case "service":
          {
            decs.providers.push(ids);
          }
          break;
        case "module": {
          decs.imports = ids;
          decs.id = p.node.arguments[0];
        }
      }
    });

  const p1: ObjectProperty = j.objectProperty(j.identifier("id"), decs.id);
  const p2: ObjectProperty = j.objectProperty(
    j.identifier("imports"),
    decs.imports
  );
  const p3: ObjectProperty = j.objectProperty(
    j.identifier("providers"),
    j.arrayExpression(
      decs.providers.map((v) =>
        j.objectExpression([
          j.objectProperty(j.identifier("provide"), j.literal(v.name)),
          j.objectProperty(j.identifier("useClass"), j.identifier(v.name)),
        ])
      )
    )
  );
  const p4: ObjectProperty = j.objectProperty(
    j.identifier("declarations"),
    j.arrayExpression([...decs.declarations])
  );
  const decorator = j.decorator(
    j.callExpression(j.identifier("NgModule"), [
      j.objectExpression([p1, p2, p3, p4]),
    ])
  );

  const moduleName = moduleC.get(0).node.declarations[0].id.name;

  moduleC.replaceWith((v) => {
    const routeConfigClassMethod = j.classMethod(
      "method",
      j.identifier("config"),
      routeConfig.get(0).node.params,
      routeConfig.get(0).node.body,
      false,
      true
    );
    routeConfigClassMethod.comments = [j.commentBlock("@ngInject")];
    const classBody = routeConfig.length ? routeConfigClassMethod : undefined;
    // j.methodDefinition("method", j.identifier(""))
    const classDec: any = j.classDeclaration(
      j.identifier(moduleName),
      j.classBody([classBody])
    );
    classDec.decorators = [decorator];
    return classDec;
  });

  routeConfig.length && routeConfig.remove();

  return root.toSource();
}
