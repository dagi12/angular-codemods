import {
  API,
  ArrayExpression,
  ASTPath,
  Collection,
  ExpressionStatement,
  FileInfo,
  FunctionExpression,
  Identifier,
  JSCodeshift,
  Literal,
  ObjectProperty,
  Options,
} from "jscodeshift";
import lodash from "lodash";
import { myPlugin } from "../shared/collection-ext";
import {
  assertCodeSize,
  initialConditions,
  pushUnique,
} from "../shared/search-util";

let j: JSCodeshift;

// FIXME ręcznie   .factory(MyHttpInterceptorFactoryName, MyHttpInterceptor)
// FIXME funckja run varuiable emitter i constant basePath

const defaultQueryResults = {
  id: null as Literal,
  imports: null as ArrayExpression,
  declarations: [] as Identifier[],
  providers: [] as { name: Literal; id: Identifier }[],
  configDeps: [] as Identifier[],
  configExprs: [] as ExpressionStatement[],
};

function find(root: Collection, moduleC: Collection) {
  const queryResults = lodash.merge({}, defaultQueryResults);

  const routeConfig = root.find(j.FunctionDeclaration, {
    id: { name: "routeConfig" },
  });

  if (routeConfig.length) {
    root.safeImportInsert(
      [j.importSpecifier(j.identifier("StateProvider"))],
      "@uirouter/angularjs"
    );
    const stateProv = j.identifier("$stateProvider");
    stateProv.typeAnnotation = j.typeAnnotation(
      j.genericTypeAnnotation(j.identifier("StateProvider"), null)
    );
    queryResults.configDeps.push(stateProv);
  }

  root.safeImportInsert(
    [j.importSpecifier(j.identifier("NgModule"))],
    "angular-ts-decorators"
  );
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
        case "config":
          {
            const configFn: FunctionExpression = p.node.arguments[0];
            if (configFn.params) {
              configFn.params.forEach((v: Identifier) =>
                pushUnique(queryResults.configDeps, v)
              );
            }
            const body = configFn.body;
            if (body && body.body) {
              queryResults.configExprs = queryResults.configExprs.concat(
                body.body.map((v) =>
                  v.type === "ReturnStatement"
                    ? (j.expressionStatement(v.argument) as any)
                    : v
                )
              );
            }
          }
          break;
        case "directive":
        case "component":
          {
            queryResults.declarations.push(ids);
          }
          break;
        case "service":
          {
            queryResults.providers.push({
              name: p.node.arguments[0],
              id: p.node.arguments[1],
            });
          }
          break;
        case "module": {
          queryResults.imports = ids;
          queryResults.id = p.node.arguments[0];
        }
      }
    });
  return { queryResults, routeConfig };
}

const buildClass = (
  replacePath: ASTPath<any>,
  queryResult: typeof defaultQueryResults,
  routeConfig: Collection
) => {
  const moduleName = replacePath.node.declarations[0].id.name;

  let classBody: any = [];

  const p1: ObjectProperty = j.objectProperty(
    j.identifier("id"),
    queryResult.id
  );
  const p2: ObjectProperty = j.objectProperty(
    j.identifier("imports"),
    queryResult.imports
  );
  const p3: ObjectProperty = j.objectProperty(
    j.identifier("providers"),
    j.arrayExpression(
      queryResult.providers.map((v) => {
        return j.objectExpression([
          j.objectProperty(j.identifier("provide"), v.name),
          j.objectProperty(j.identifier("useClass"), v.id),
        ]);
      })
    )
  );
  const p4: ObjectProperty = j.objectProperty(
    j.identifier("declarations"),
    j.arrayExpression([...queryResult.declarations])
  );
  const decorator = j.decorator(
    j.callExpression(j.identifier("NgModule"), [
      j.objectExpression([p1, p2, p3, p4]),
    ])
  );

  const routeConfigClassMethod = j.classMethod(
    "method",
    j.identifier("config"),
    queryResult.configDeps,
    j.blockStatement([
      ...queryResult.configExprs,
      ...(routeConfig.length ? routeConfig.get(0).node.body.body : []),
    ]),
    false,
    true
  );
  routeConfigClassMethod.comments = [j.commentBlock("@ngInject")];
  classBody = [routeConfigClassMethod];

  const classDec: any = j.classDeclaration(
    j.identifier(moduleName),
    j.classBody(classBody)
  );
  classDec.decorators = [decorator];

  routeConfig.length && routeConfig.remove();

  return classDec;
};

export default function transformer(
  fileInfo: FileInfo,
  api: API,
  options: Options
) {
  j = api.jscodeshift;
  j.use(myPlugin);
  const root = j(fileInfo.source);
  const rootExports = root.find(j.ExportNamedDeclaration);

  const initialNode = rootExports
    .find(j.VariableDeclaration, {
      kind: "const",
    })
    .filter((p: any) => {
      const name: string = p.node.declarations[0].id.name;
      return name.endsWith("Module");
    });

  const {
    beginCount,
    beginLn,
    mainPath: moduleC,
  } = initialConditions(
    fileInfo,
    root,
    root.find(j.ClassDeclaration),
    initialNode
  );
  if (!moduleC) {
    return;
  }

  const { queryResults, routeConfig } = find(root, moduleC);

  moduleC.replaceWith((p) => buildClass(p, queryResults, routeConfig));

  assertCodeSize(beginCount, beginLn, j, root, options);
  return root.toSource();
}
