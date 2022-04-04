import { StatementKind } from "ast-types/gen/kinds";
import {
  API,
  ASTPath,
  BlockStatement,
  Collection,
  ExportNamedDeclaration,
  FileInfo,
  Function,
  Identifier,
  JSCodeshift,
  ObjectExpression,
  ObjectProperty,
  Options,
} from "jscodeshift";
import { groupFunctionContent } from "../shared/class-builder";
import { myPlugin } from "../shared/collection-ext";
import {
  assertCodeSize,
  initialConditions,
  isDirectChildOf,
} from "../shared/search-util";
import { replaceHtmlVariables } from "./html";

let j: JSCodeshift;

const defaultFindResults = {
  linkFn: null as Collection<ObjectProperty>,
  ctrlFnBodyBlock: null as Collection<ObjectProperty>,
  directiveFnPath: null as ASTPath<Function>,
  extraStmtToOnInit: [] as StatementKind[],
  depParams: [] as Identifier[],
  directiveExport: null as Collection<ExportNamedDeclaration>,
  htmlReplaceVarNames: [] as string[],
  templateNode: null as ASTPath<ObjectExpression>,
  scopeNode: null as ObjectProperty,
  isNotStringTmpl: true,
};

export type FindResult = typeof defaultFindResults;

function find(root: Collection, startPath: Collection) {
  root.safeImportInsert(j.identifier("IController"), "angular");
  root.safeImportInsert(j.identifier("IComponentOptions"), "angular");

  const directiveObjectBlock: Collection = startPath.closest(
    j.ObjectExpression
  );

  const directiveOuterBlock: Collection<BlockStatement> =
    directiveObjectBlock.closest(j.BlockStatement);
  const directiveFn: Collection<Function> = directiveOuterBlock.closest(
    j.Function
  );

  const results: FindResult = {
    ...defaultFindResults,
    templateNode: startPath.get(0).node,
    depParams: directiveFn.get(0).node.params,
    directiveExport: directiveFn.closest(j.ExportNamedDeclaration),
  };

  directiveObjectBlock
    .find(j.MemberExpression, { object: { name: "$scope" } })
    .forEach((p: any) => {
      return results.htmlReplaceVarNames.push(p.value.property.name);
    });

  directiveObjectBlock
    .find(j.MemberExpression, { object: { name: "scope" } })
    .forEach((p: any) => {
      const propertyName: string = p.value.property.name;
      if (!results.htmlReplaceVarNames.includes(propertyName)) {
        return results.htmlReplaceVarNames.push(propertyName);
      }
    });

  const scopeProperty = directiveObjectBlock.find(j.ObjectProperty, {
    key: { name: "scope" },
  });

  const scopeNode = scopeProperty.length
    ? scopeProperty.get(0).node
    : undefined;

  if (scopeNode) {
    const properties = scopeNode.value.properties;
    if (properties) {
      properties.forEach((p: any) => {
        const propertyName: string = p.key.name;
        if (!results.htmlReplaceVarNames.includes(propertyName)) {
          return results.htmlReplaceVarNames.push(propertyName);
        }
      });
    }
  }

  const ctrlFnProperty = directiveObjectBlock.find(j.ObjectProperty, {
    key: { name: "controller" },
  });

  if (ctrlFnProperty.length) {
    const ctrlFn = ctrlFnProperty.get(0).node.value;
    ctrlFn.params.forEach((n: Identifier) => {
      if (n.name !== "$scope") {
        results.depParams.push(n);
      }
    });

    results.ctrlFnBodyBlock = j(ctrlFn.body);
  }

  results.depParams.forEach((param) => {
    directiveOuterBlock
      .find(j.Identifier, {
        name: param.name,
      })
      .replaceWith((path) => j.memberExpression(j.thisExpression(), path.node));
  });

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
      compileFunCollection
        .find(j.Identifier, { name: "attrs" })
        .replaceWith(j.identifier("this"));
    }
    const returnBlock = compileObject.find(j.ReturnStatement);
    results.linkFn = returnBlock.find(j.ObjectProperty, {
      key: { name: "post" },
    });
  }

  results.directiveFnPath = directiveFn.get(0);
  results.scopeNode = scopeNode;

  return results;
}

function buildClass(results: typeof defaultFindResults) {
  const {
    linkFn,
    ctrlFnBodyBlock,
    directiveFnPath,
    depParams,
    extraStmtToOnInit,
    directiveExport,
    templateNode,
    scopeNode,
  } = results;

  const {
    methods: classPropertiesFromLinkFn,
    statements: linkNonFunExpressions,
  } = groupFunctionContent(linkFn);

  const {
    methods: classPropertiesFromCtrlFn,
    statements: ctrlNonFunExpressions,
  } = groupFunctionContent(ctrlFnBodyBlock);

  linkFn &&
    linkFn
      .find(j.Identifier, { name: "scope" })
      .replaceWith(j.thisExpression());

  ctrlFnBodyBlock &&
    ctrlFnBodyBlock
      .find(j.Identifier, { name: "$scope" })
      .replaceWith(j.thisExpression());

  const tmpDirectiveName = directiveFnPath.node.id
    ? directiveFnPath.node.id.name
    : directiveFnPath.parent.node.id.name;

  const directiveName =
    tmpDirectiveName.indexOf("Directive") >= 0
      ? tmpDirectiveName.split("Directive")[0]
      : tmpDirectiveName;
  const compCtrlClassName: string = directiveName + "Controller";
  const ctrorParams = depParams.map((v) => {
    const tsParam = j.tsParameterProperty(j.identifier(v.name));
    if (!v.typeAnnotation) {
      const typeAnnotationDepNameMap = {
        $timeout: "ITimeoutService",
        $state: "StateService",
      };
      const typeAnn = typeAnnotationDepNameMap[v.name];
      if (!typeAnn) {
        throw new TypeError("Couldn't find type for " + v.name);
      }
      v.typeAnnotation = typeAnn;
    }
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

  const compCtrlClassDec = j.classDeclaration(
    j.identifier(compCtrlClassName),
    j.classBody([
      ctor,
      j.methodDefinition(
        "method",
        j.identifier("$onInit"),
        j.functionExpression(
          null,
          [],
          j.blockStatement([
            ...extraStmtToOnInit,
            ...(ctrlNonFunExpressions as any),
          ])
        )
      ),
      j.methodDefinition(
        "method",
        j.identifier("$postLink"),
        j.functionExpression(
          null,
          [],
          j.blockStatement([...(linkNonFunExpressions as any)])
        )
      ),
      ...classPropertiesFromLinkFn,
      ...classPropertiesFromCtrlFn,
    ])
  );

  compCtrlClassDec.implements = [
    j.classImplements(j.identifier("IController")),
  ];

  results.isNotStringTmpl =
    templateNode.value.type !== j.StringLiteral.toString();

  const isIsolatedScope =
    scopeNode &&
    scopeNode.value &&
    typeof (scopeNode.value as any).value !== "boolean";
  const componentDefObjectExpr: ObjectExpression = j.objectExpression([
    ...(isIsolatedScope
      ? [j.objectProperty(j.identifier("bindings"), scopeNode.value)]
      : []),
    j.objectProperty(
      j.identifier("controller"),
      j.identifier(compCtrlClassName)
    ),
    j.objectProperty(j.identifier("template"), templateNode.value),
  ]);

  const compId = j.identifier(directiveName + "Component");
  compId.typeAnnotation = j.typeAnnotation(
    j.genericTypeAnnotation(j.identifier("IComponentOptions"), null)
  );

  const compDef = j.exportDeclaration(
    false,
    j.variableDeclaration("const", [
      j.variableDeclarator(compId, componentDefObjectExpr),
    ])
  );

  directiveExport.insertBefore(compCtrlClassDec).insertAfter(compDef);

  directiveExport.remove();
}

export default function transformer(
  fileInfo: FileInfo,
  api: API,
  options: Options
) {
  j = api.jscodeshift;
  j.use(myPlugin);
  const root = j(fileInfo.source);
  const rootExports = root.find(j.ExportNamedDeclaration);

  const initialPath = rootExports
    // Pierwsza eksportowana funkcja wcale nie musi być dyrektywą
    // .at(0)
    .find(j.Function)
    .find(j.BlockStatement)
    .find(j.ReturnStatement)
    .find(j.ObjectExpression)
    .find(j.ObjectProperty);

  const { beginCount, beginLn, mainPath } = initialConditions(
    fileInfo,
    root,
    root.find(j.ObjectProperty, {
      key: { name: "bindings" },
    }),
    initialPath
  );
  if (!mainPath) {
    return;
  }

  const results = find(root, initialPath);

  buildClass(results);

  if (!!results.htmlReplaceVarNames.length && results.isNotStringTmpl) {
    replaceHtmlVariables(results.htmlReplaceVarNames, fileInfo.path);
  }

  assertCodeSize(beginLn, beginCount, j, root, options);

  return root.toSource();
}
