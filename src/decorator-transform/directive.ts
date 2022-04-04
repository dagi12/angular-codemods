import { StatementKind } from "ast-types/gen/kinds";
import {
  API,
  ASTPath,
  BlockStatement,
  ClassProperty,
  Collection,
  FileInfo,
  Function,
  Identifier,
  JSCodeshift,
  ObjectProperty,
  Options,
} from "jscodeshift";
import { default as loadash, default as lodash } from "lodash";
import "../shared/collection-ext";
import { myPlugin } from "../shared/collection-ext";
import {
  assertCodeSize,
  initialConditions,
  isDirectChildOf,
  pushUnique,
  reassignForBuilder,
} from "../shared/search-util";

const defaultFindResults = {
  linkFn: null as Collection<ObjectProperty>,
  ctrlFnBodyBlock: undefined as Collection<ObjectProperty>,
  directiveFn: null as Collection<Function>,
  extraStmtToOnInit: [] as StatementKind[],
  depParams: [] as Identifier[],
  template: null as ObjectProperty[],
  scope: null as ObjectProperty[],
  require: null as ObjectProperty[],
  transclue: null as ObjectProperty[],
  priority: null as ObjectProperty[],
};

export type FindResult = typeof defaultFindResults;

function find(j: JSCodeshift, root: Collection, startPath: Collection) {
  root.safeImportInsert(j.identifier("OnInit"), "angular-ts-decorators");
  root.safeImportInsert(j.identifier("Directive"), "angular-ts-decorators");
  root.safeImportInsert(j.identifier("ViewParent"), "angular-ts-decorators");
  root.safeImportInsert(j.identifier("AfterViewInit"), "angular-ts-decorators");

  const directiveObjectBlock: Collection = startPath.closest(
    j.ObjectExpression
  );

  const directiveOuterBlock: Collection<BlockStatement> =
    directiveObjectBlock.closest(j.BlockStatement);

  const directiveFn: Collection<Function> = directiveOuterBlock.closest(
    j.Function
  );

  const results: FindResult = loadash.merge({}, defaultFindResults);

  results.directiveFn = directiveFn;

  reassignForBuilder(directiveObjectBlock, results, j.ObjectProperty, [
    "template",
    "scope",
    "transclude",
    "require",
    "priority",
    "replace",
    "bindToController",
  ]);

  const ctrlFnProperty = directiveObjectBlock.find(j.ObjectProperty, {
    key: { name: "controller" },
  });

  results.directiveFn
    .get(0)
    .node.params.forEach((p: any) => pushUnique(results.depParams, p));
  if (ctrlFnProperty.length) {
    const ctrlFn = ctrlFnProperty.get(0).node.value;
    ctrlFn.params.forEach((n: Identifier) => {
      pushUnique(results.depParams, n);
    });

    results.ctrlFnBodyBlock = j(ctrlFn.body);
  }

  results.linkFn = directiveObjectBlock.find(j.ObjectProperty, {
    key: { name: "link" },
  });

  if (!results.linkFn.length) {
    const compileObject: Collection = directiveObjectBlock.find(
      j.ObjectProperty,
      {
        key: { name: "compile" },
      }
    );
    if (compileObject.length === 1) {
      const compileBlock = compileObject.find(j.BlockStatement);
      const compileFunCollection = compileBlock
        .find(j.ExpressionStatement)
        .filter((p) => isDirectChildOf(compileBlock, p))
        .filter((p: ASTPath) => p.node.type !== j.ReturnStatement.toString());
      results.extraStmtToOnInit = compileFunCollection.nodes();
    }
    const returnBlock = compileObject.find(j.ReturnStatement);
    results.linkFn = returnBlock.find(j.ObjectProperty, {
      key: { name: "post" },
    });
  }

  if (results.linkFn.length) {
    if (!results.depParams.some((v) => v.name === "$attrs")) {
      results.depParams.push(j.identifier("$attrs"));
    }
    if (!results.depParams.some((v) => v.name === "$element")) {
      results.depParams.push(j.identifier("$element"));
    }
    if (!results.depParams.some((v) => v.name === "$scope")) {
      results.depParams.push(j.identifier("$scope"));
    }
  }

  renameMembers(j, directiveObjectBlock, results, directiveOuterBlock);

  return results;
}

function renameMembers(
  j: JSCodeshift,
  directiveObjectBlock: Collection<any>,
  results: FindResult,
  directiveOuterBlock: Collection<BlockStatement>
) {
  directiveObjectBlock.renamePropertiesBy({
    element: "$element",
    scope: "$scope",
    attrs: "$attrs",
  });
  results.depParams.forEach((param) => {
    directiveOuterBlock
      .find(j.Identifier, {
        name: param.name,
      })
      .replaceWith((path) => j.memberExpression(j.thisExpression(), path.node));
  });

  directiveOuterBlock
    .find(j.Identifier, {
      name: "ctrl",
    })
    .replaceWith((path) => j.memberExpression(j.thisExpression(), path.node));
}

function buildClass(
  j: JSCodeshift,
  results: Partial<typeof defaultFindResults>
) {
  const { linkFn, ctrlFnBodyBlock, depParams, extraStmtToOnInit } = results;

  const directiveFnPath = results.directiveFn.get(0);
  const tmpDirectiveName = directiveFnPath.node.id
    ? directiveFnPath.node.id.name
    : directiveFnPath.parent.node.id.name;

  const selectorName = "[" + lodash.kebabCase(tmpDirectiveName) + "]";

  const ctrorParams = depParams.map((v) => {
    const tsParam = j.tsParameterProperty(j.identifier(v.name));
    tsParam.parameter = v;
    tsParam.accessibility = "private";
    return tsParam;
  });

  const ctor = j.methodDefinition(
    "constructor",
    j.identifier("constructor"),
    j.functionExpression(null, ctrorParams, j.blockStatement([]))
  );
  ctor.comments = [j.commentBlock("@ngInject")];

  results.directiveFn.closest(j.ExportNamedDeclaration).replaceWith((v) => {
    let propDef: ClassProperty[] = [];

    const requirePath = results.require[0];
    if (requirePath && requirePath.value.type === "StringLiteral") {
      const classProp = j.classProperty(j.identifier("ctrl"), null);

      (classProp as any).decorators = [
        j.callExpression(j.identifier("@ViewParent"), [
          j.stringLiteral((requirePath.value as any).value),
        ]),
      ];

      propDef = [classProp];
    }

    const tmpDirectiveName = directiveFnPath.node.id
      ? directiveFnPath.node.id.name
      : directiveFnPath.parent.node.id.name;

    const dirCtrlClassDec = j.classDeclaration(
      j.identifier(tmpDirectiveName),
      j.classBody([
        ctor,
        ...propDef,
        j.methodDefinition(
          "method",
          j.identifier("ngOnInit"),
          j.functionExpression(
            null,
            [],
            j.blockStatement([
              ...extraStmtToOnInit,
              ...(ctrlFnBodyBlock ? ctrlFnBodyBlock.get(0).node.body : []),
            ])
          )
        ),
        j.methodDefinition(
          "method",
          j.identifier("ngAfterViewInit"),
          j.functionExpression(
            null,
            [],
            linkFn.length ? linkFn.get(0).node.value.body : j.blockStatement([])
          )
        ),
      ])
    );

    dirCtrlClassDec.implements = [
      j.classImplements(j.identifier("OnInit")),
      j.classImplements(j.identifier("AfterViewInit")),
    ];
    (dirCtrlClassDec as any).decorators = [
      j.decorator(
        j.callExpression(j.identifier("Directive"), [
          j.objectExpression([
            j.objectProperty(
              j.identifier("selector"),
              j.stringLiteral(selectorName)
            ),
            ...results.require,
            ...results.scope,
            ...results.template,
          ]),
        ])
      ),
    ];

    return j.exportNamedDeclaration(dirCtrlClassDec);
  });
}

export default function transformer(
  fileInfo: FileInfo,
  api: API,
  options: Options
) {
  const j = api.jscodeshift;
  j.use(myPlugin);
  const root = j(fileInfo.source);

  const initialPath = root
    .find(j.ExportNamedDeclaration)
    .find(j.Function)
    .find(j.BlockStatement)
    .find(j.ReturnStatement)
    .find(j.ObjectExpression)
    .find(j.ObjectProperty)
    .filter((p: any) =>
      ["scope", "require", "compile", "transclude", "link"].includes(
        p.node.key.name
      )
    );

  const { beginCount, beginLn, mainPath } = initialConditions(
    fileInfo,
    root,
    root.find(j.ImportSpecifier, {
      imported: { name: "Directive" },
    }),
    initialPath
  );
  if (!mainPath) {
    return;
  }

  const results = find(j, root, initialPath);

  buildClass(j, results);

  assertCodeSize(beginCount, beginLn, j, root, options);

  return root.toSource();
}

// FIXME wyszukaj pozostałe dyrektywy i przepisz ręcznie
