import fs from "fs";
import {
  API,
  AssignmentExpression,
  ASTPath,
  BlockStatement,
  ClassProperty,
  Collection,
  Expression,
  ExpressionStatement,
  FileInfo,
  Function,
  FunctionDeclaration,
  Identifier,
  JSCodeshift,
  ObjectExpression,
} from "jscodeshift";
import HTMLParser from "node-html-parser";
import { createArrowFunctionExpression2 } from "../shared/build-util";
import "../shared/collection-ext";
import { collectionExt, MyCollection } from "../shared/collection-ext";
import { fileExists } from "../shared/fs-util";
import { assertOne, isDirectChildOf, isSingle } from "../shared/search-util";

function fromDeclaration(toClassArrow: FunctionDeclaration): ClassProperty {
  const arrowFunc = j.arrowFunctionExpression(
    toClassArrow.params,
    toClassArrow.body,
    false
  );
  arrowFunc.returnType = toClassArrow.returnType;
  arrowFunc.defaults = toClassArrow.defaults;
  arrowFunc.rest = toClassArrow.rest;
  arrowFunc.async = toClassArrow.async;

  return j.classProperty(
    j.identifier(toClassArrow.id.name),
    arrowFunc,
    null,
    false
  );
}

function fromFunExpr(toClassArrow: any): ClassProperty {
  const expr = toClassArrow.expression;
  return j.classProperty(
    j.identifier(expr.left.property.name),
    createArrowFunctionExpression2(expr.right as any),
    null,
    false
  );
}

function fromAssignmentArrow(toClassArrow: any): ClassProperty {
  const expr = toClassArrow.expression;
  return j.classProperty(
    j.identifier(expr.left.property.name),
    createArrowFunctionExpression2(expr.right as any),
    null,
    false
  );
}

function convertToClassProperties(
  funDecs: ASTPath<FunctionDeclaration>[],
  funExprs: ASTPath<AssignmentExpression>[],
  arrExprs: ASTPath<AssignmentExpression>[]
): ClassProperty[] {
  return [
    ...funDecs.map((a) => fromDeclaration(a.node)),
    ...funExprs.map((a) => fromFunExpr(a.node)),
    ...arrExprs.map((a) => fromAssignmentArrow(a.node)),
  ];
}

export function scopeBlockFunExpressions(
  parentCollection: Collection<BlockStatement>
): {
  [_: string]: ASTPath<any>[];
} {
  const funDeclars: ASTPath[] = [];
  const memberFunExprs: ASTPath[] = [];
  const memberArrowFunExprs: ASTPath[] = [];

  parentCollection
    .map((parentPath: ASTPath<any>) => {
      const decs = j(parentPath).find(j.FunctionDeclaration);
      const exprs = j(parentPath).find(j.ExpressionStatement);
      const pathArr: ASTPath<any>[] = [
        ...decs
          .filter((p) => {
            return p.parentPath == parentPath;
          })
          .paths(),
        ...exprs
          .filter((p) => {
            return p.parentPath.node === parentPath.node;
          })
          .paths(),
      ];
      return pathArr;
    })
    .forEach((path) => {
      const node = path.node as ExpressionStatement;
      switch (node.type) {
        case j.FunctionDeclaration.toString():
          funDeclars.push(path);
          break;
        case j.ExpressionStatement.toString(): {
          const expr = node.expression as AssignmentExpression;
          if (expr && expr.right) {
            if (expr.right.type === j.FunctionExpression.toString()) {
              memberFunExprs.push(path);
            } else if (
              expr.right.type === j.ArrowFunctionExpression.toString()
            ) {
              memberArrowFunExprs.push(path);
            }
          }
        }
      }
    });

  return { funDeclars, memberFunExprs, memberArrowFunExprs };
}

function nonFunExpressionsInBlock(
  fnBlockNodeCollection: Collection<BlockStatement>
): Expression[] {
  const linkFunBlockFunExprs = scopeBlockFunExpressions(fnBlockNodeCollection);

  const linkFunBlockFunNodes = Object.values(linkFunBlockFunExprs)
    .flat(2)
    .map((v) => v.node);

  return fnBlockNodeCollection
    .find(j.Statement)
    .filter((p) => isDirectChildOf(fnBlockNodeCollection, p))
    .filter((p: ASTPath<ExpressionStatement>) => {
      return !linkFunBlockFunNodes.includes(p.node);
    })
    .nodes();
}

let j: JSCodeshift;

export default function transformer(file: FileInfo, api: API) {
  j = api.jscodeshift;
  j.registerMethods(collectionExt);

  const root = j(file.source) as MyCollection;

  root.insertAtTheBegining(
    'import { IComponentOptions, IController } from "angular";'
  );

  const rootExports = root.find(j.ExportNamedDeclaration);

  const tmpTemplateNode = rootExports
    // Pierwsza eksportowana funkcja wcale nie musi być dyrektywą
    // .at(0)
    .find(j.Function)
    .find(j.BlockStatement)
    .find(j.ReturnStatement)
    .find(j.ObjectExpression)
    .find(j.ObjectProperty, {
      key: { name: "template" },
    })
    .at(0);

  if (!tmpTemplateNode) {
    throw new TypeError("Directive without template");
  }

  const directiveObjectBlock: Collection = tmpTemplateNode.closest(
    j.ObjectExpression
  );

  const directiveOuterBlock: Collection<BlockStatement> =
    directiveObjectBlock.closest(j.BlockStatement);
  const directiveFn: Collection<Function> = directiveOuterBlock.closest(
    j.Function
  );
  const directiveExport: Collection = directiveFn.closest(
    j.ExportNamedDeclaration
  );

  assertOne(directiveExport);
  assertOne(directiveOuterBlock);
  assertOne(directiveFn);

  const dependencyParams: Identifier[] = directiveFn.get(0).node.params;

  const htmlReplaceVarNames: string[] = [];

  directiveObjectBlock
    .find(j.MemberExpression, { object: { name: "$scope" } })
    .forEach((p: any) => {
      return htmlReplaceVarNames.push(p.value.property.name);
    });

  directiveObjectBlock
    .find(j.MemberExpression, { object: { name: "scope" } })
    .forEach((p: any) => {
      const propertyName: string = p.value.property.name;
      if (!htmlReplaceVarNames.includes(propertyName)) {
        return htmlReplaceVarNames.push(propertyName);
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
        if (!htmlReplaceVarNames.includes(propertyName)) {
          return htmlReplaceVarNames.push(propertyName);
        }
      });
    }
  }

  const templateNode = tmpTemplateNode.get(0).node;

  const ctrlFnProperty = directiveObjectBlock.find(j.ObjectProperty, {
    key: { name: "controller" },
  });

  const ctrlFn = ctrlFnProperty.get(0).node.value;
  ctrlFn.params.forEach((n: Identifier) => {
    if (n.name !== "$scope") {
      dependencyParams.push(n);
    }
  });

  const ctrlFnBodyBlock = j(ctrlFn.body);

  dependencyParams.forEach((param) => {
    directiveOuterBlock
      .find(j.Identifier, {
        name: param.name,
      })
      .replaceWith((path) => j.memberExpression(j.thisExpression(), path.node));
  });

  let linkFn = directiveObjectBlock.find(j.ObjectProperty, {
    key: { name: "link" },
  });

  let extraStmtToOnInit: any[] = [];

  if (!linkFn.length) {
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
      extraStmtToOnInit = compileFunCollection.nodes();
      compileFunCollection
        .find(j.Identifier, { name: "attrs" })
        .replaceWith(j.identifier("this"));
    }
    const returnBlock = compileObject.find(j.ReturnStatement);
    linkFn = returnBlock.find(j.ObjectProperty, {
      key: { name: "post" },
    });
  }

  linkFn
    .find(j.Identifier, { name: "scope" })
    .replaceWith(j.identifier("this"));

  ctrlFnBodyBlock
    .find(j.Identifier, { name: "$scope" })
    .replaceWith(j.identifier("this"));

  let classPropertiesFromLinkFn: ClassProperty[] = [];
  let linkNonFunExpressions: any[] = [];
  if (isSingle(linkFn)) {
    const linkFnBlock = linkFn.find(j.BlockStatement).at(0);
    const linkFunExprs = scopeBlockFunExpressions(linkFnBlock);
    linkNonFunExpressions = nonFunExpressionsInBlock(linkFnBlock);
    classPropertiesFromLinkFn = convertToClassProperties(
      linkFunExprs.funDeclars,
      linkFunExprs.memberFunExprs,
      linkFunExprs.memberArrowFunExprs
    );
  }

  let classPropertiesFromCtrlFn: any = [];
  let ctrlNonFunExpressions: any[] = [];
  if (isSingle(ctrlFnBodyBlock)) {
    const ctrlFunExprs = scopeBlockFunExpressions(ctrlFnBodyBlock);
    ctrlNonFunExpressions = nonFunExpressionsInBlock(ctrlFnBodyBlock);
    classPropertiesFromCtrlFn = convertToClassProperties(
      ctrlFunExprs.funDeclars,
      ctrlFunExprs.memberFunExprs,
      ctrlFunExprs.memberArrowFunExprs
    );
  }

  const directeFnPath = directiveFn.get(0);
  const tmpDirectiveName = directeFnPath.node.id
    ? directiveFn.get(0).node.id.name
    : directiveFn.get(0).parent.node.id.name;
  const directiveName =
    tmpDirectiveName.indexOf("Directive") >= 0
      ? tmpDirectiveName.split("Directive")[0]
      : tmpDirectiveName;
  const compCtrlClassName: string = directiveName + "Controller";
  const ctrorParams = dependencyParams.map((v) => {
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
          j.blockStatement([...extraStmtToOnInit, ...ctrlNonFunExpressions])
        )
      ),
      j.methodDefinition(
        "method",
        j.identifier("$postLink"),
        j.functionExpression(
          null,
          [],
          j.blockStatement([...linkNonFunExpressions])
        )
      ),
      ...classPropertiesFromLinkFn,
      ...classPropertiesFromCtrlFn,
    ])
  );

  compCtrlClassDec.implements = [
    j.classImplements(j.identifier("IController")),
  ];

  const isNotStringTmpl =
    templateNode.value.type !== j.StringLiteral.toString();

  const isIsolatedScope =
    scopeNode && scopeNode.value && typeof scopeNode.value.value !== "boolean";
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

  if (!!htmlReplaceVarNames.length && isNotStringTmpl) {
    replaceHtmlVariables(htmlReplaceVarNames, file.path);
  }

  return root.toSource();
}

function replaceHtmlVariables(tokens: string[], filePath: string) {
  const tmpInFilePath = filePath.split(".").slice(0, -1).join(".") + ".html";
  const tmpInFilePath2 = filePath.split(".").slice(0, -2).join(".") + ".html";
  let htmlFilePath;

  if (fileExists(tmpInFilePath)) {
    htmlFilePath = tmpInFilePath;
  } else if (fileExists(tmpInFilePath2)) {
    htmlFilePath = tmpInFilePath2;
  }
  if (htmlFilePath) {
    const root = HTMLParser(fs.readFileSync(htmlFilePath).toString());
    const allElements = root.querySelectorAll("*");
    tokens.forEach((token) => {
      allElements.forEach((elem) => {
        const attrEntries = Object.entries(elem.attrs);
        const newToken = "$ctrl." + token;
        for (let [key, value] of attrEntries) {
          if (
            value.includes(token) &&
            !value.includes(newToken) &&
            (!limitedAttrs[token] || limitedAttrs[token] === key) &&
            token !== attrTokenEdgeCaseMap[key]
          ) {
            elem.setAttribute(key, replaceAll(value, token, newToken));
          }
        }
        const textToReplace = elem.structuredText.trim();
        if (
          elem.childNodes.length === 1 &&
          elem.firstChild.constructor.name === "TextNode" &&
          textToReplace.includes(token) &&
          !textToReplace.includes(newToken) &&
          textToReplace.includes("{{")
        ) {
          const open = textToReplace.split("{{");
          const close = open[1].split("}}");
          const replaced = replaceAll(close[0], token, newToken);
          elem.textContent = `${open[0]}{{ ${replaced} }}${close[1]}`;
        }
      });
    });
    fs.writeFileSync(htmlFilePath, root.outerHTML);
  }
}

const attrTokenEdgeCaseMap = {
  class: "label",
  "ng-model": "controller",
  "ng-if-inside": "id",
};

const limitedAttrs = {
  id: "id",
};

function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
