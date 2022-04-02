import fs from "fs";
import {
  API,
  AssignmentExpression,
  ASTNode,
  ASTPath,
  ClassProperty,
  Collection,
  ExpressionStatement,
  FileInfo,
  FunctionDeclaration,
  Identifier,
  JSCodeshift,
  ObjectExpression,
} from "jscodeshift";
import HTMLParser from "node-html-parser";
import { createArrowFunctionExpression2 } from "../shared/build-util";
import "../shared/collection-ext";
import { fileExists } from "../shared/fs-util";
import { isDirectChildOf } from "../shared/search-util";
import { collectionExt, MyCollection } from "./../shared/collection-ext";

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
  return j.classProperty(
    j.identifier(toClassArrow.left.property.name),
    createArrowFunctionExpression2(toClassArrow.right as any),
    null,
    false
  );
}

function fromAssignmentArrow(toClassArrow: any): ClassProperty {
  return j.classProperty(
    j.identifier(toClassArrow.left.property.name),
    createArrowFunctionExpression2(toClassArrow.right as any),
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

export function allFunExpressions(parentNode: Collection) {
  const funDeclars = parentNode.find(j.FunctionDeclaration);

  const memberFunExprs = parentNode.find(j.AssignmentExpression, {
    left: {
      type: "MemberExpression",
    },
    right: {
      type: "FunctionExpression",
    },
  });

  const memberArrowFunExprs = parentNode.find(j.AssignmentExpression, {
    left: {
      type: "MemberExpression",
    },
    right: {
      type: "ArrowFunctionExpression",
    },
  });

  return { funDeclars, memberFunExprs, memberArrowFunExprs };
}

function nonFunExpressionsInBlock(
  parentNodePath: Collection
): ExpressionStatement[] {
  const fnBlockNodePath = parentNodePath.find(j.BlockStatement).at(0);

  const linkFunBlockFuns = allFunExpressions(fnBlockNodePath);

  const linkFunBlockFunsPaths: ASTNode[] = [
    ...linkFunBlockFuns.funDeclars.nodes(),
    ...linkFunBlockFuns.memberFunExprs.nodes(),
    ...linkFunBlockFuns.memberArrowFunExprs.nodes(),
  ];

  const blockExprs: Collection = fnBlockNodePath.find(j.ExpressionStatement);
  const directExprs = blockExprs.filter((p) =>
    isDirectChildOf(fnBlockNodePath, p)
  );
  const funsExclusions = directExprs.filter(
    (p: ASTPath<ExpressionStatement>) => {
      return !linkFunBlockFunsPaths.includes(p.node.expression);
    }
  );
  return funsExclusions.nodes();
}

let j: JSCodeshift;

const parentExprTypeAccessPropertyNameMap = {
  MemberExpression: "object",
  CallExpression: "callee",
};

export default function transformer(file: FileInfo, api: API) {
  j = api.jscodeshift;
  j.registerMethods(collectionExt);

  const root = j(file.source) as MyCollection;

  root.insertAtTheBegining(
    root,
    'import { IComponentOptions, IController } from "angular";'
  );

  const directiveExport = root.find(j.ExportNamedDeclaration);

  const directiveFn: Collection = directiveExport
    .find(j.FunctionDeclaration)
    .at(0);

  const dependencyParams: Identifier[] = directiveFn.get(0).node.params;

  const directiveOuterBlock = directiveFn.find(j.BlockStatement).at(0);

  const directiveObjectBlock = directiveOuterBlock
    .find(j.ReturnStatement)
    .at(0)
    .find(j.ObjectExpression);

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

  const properties = scopeNode.value.properties;
  if (properties) {
    properties.forEach((p: any) => {
      const propertyName: string = p.key.name;
      if (!htmlReplaceVarNames.includes(propertyName)) {
        return htmlReplaceVarNames.push(propertyName);
      }
    });
  }

  const tmpTemplateNode = directiveFn
    .find(j.ObjectProperty, {
      key: { name: "template" },
    })
    .at(0);

  if (!tmpTemplateNode) {
    throw new TypeError("Directive without template");
  }

  const templateNode = tmpTemplateNode.get(0).node;

  const ctrlFn = directiveObjectBlock.find(j.ObjectProperty, {
    key: { name: "controller" },
  });

  ctrlFn.get(0).node.value.params.forEach((n: Identifier) => {
    if (n.name !== "$scope") {
      dependencyParams.push(n);
    }
  });

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

  ctrlFn
    .find(j.Identifier, { name: "$scope" })
    .replaceWith(j.identifier("this"));

  // todo type
  const linkNonFunExpressions: ExpressionStatement[] =
    nonFunExpressionsInBlock(linkFn);
  const ctrlNonFunExpressions: ExpressionStatement[] =
    nonFunExpressionsInBlock(ctrlFn);

  const linkFunExprs = allFunExpressions(linkFn);
  const ctrlFunExprs = allFunExpressions(ctrlFn);

  // Utwórz klasę kontrolera
  const classPropertiesFromLinkFn = convertToClassProperties(
    linkFunExprs.funDeclars.paths(),
    linkFunExprs.memberFunExprs.paths(),
    linkFunExprs.memberArrowFunExprs.paths()
  );

  const classPropertiesFromCtrlFn = convertToClassProperties(
    ctrlFunExprs.funDeclars.paths(),
    ctrlFunExprs.memberFunExprs.paths(),
    ctrlFunExprs.memberArrowFunExprs.paths()
  );

  const tmpDirectiveName = directiveFn.get(0).node.id.name;
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

  if (!!htmlReplaceVarNames.length) {
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
  } else {
    throw new Error("HTML template not found");
  }
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
