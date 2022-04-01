import child_process from "child_process";
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
  JSCodeshift,
  ObjectExpression,
} from "jscodeshift";
import { createArrowFunctionExpression2 } from "../shared/build-util";
import "../shared/collection-ext";
import { assertOne, isDirectChildOf } from "../shared/search-util";
import { ObjectProperty } from "./../../node_modules/.staging/@babel/types-9c30f3bb/lib/index-legacy.d";
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

// todo type
function fromFunExpr(toClassArrow: any): ClassProperty {
  return j.classProperty(
    j.identifier(toClassArrow.left.property.name),
    createArrowFunctionExpression2(toClassArrow.right as any),
    null,
    false
  );
}

// todo type
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

function funExprsInBlock(parentNodePath: Collection) {
  const linkFnBlockNodePath = parentNodePath
    .find(j.FunctionExpression)
    .at(0)
    .find(j.BlockStatement);

  return allFunExpressions(linkFnBlockNodePath);
}

function nonFunExpressionsInBlock(
  parentNodePath: Collection
): ExpressionStatement[] {
  const fnBlockNodePath = parentNodePath
    .find(j.FunctionExpression)
    .at(0)
    .find(j.BlockStatement)
    .at(0);

  const linkFunBlockFuns = allFunExpressions(fnBlockNodePath);

  const linkFunBlockFunsPaths: ASTNode[] = [
    ...linkFunBlockFuns.funDeclars.nodes(),
    ...linkFunBlockFuns.memberFunExprs.nodes(),
    ...linkFunBlockFuns.memberArrowFunExprs.nodes(),
  ];

  const blockExprs = fnBlockNodePath.find(j.ExpressionStatement);
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

function dependenciesFromFun(nodePath: ASTPath<FunctionDeclaration>) {
  // TODO
  // Zgrupuj dependency
}

let j: JSCodeshift;

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

  const directiveBlock = directiveFn
    .find(j.BlockStatement)
    .at(0)
    .find(j.ReturnStatement)
    .at(0)
    .find(j.ObjectExpression);

  const htmlReplaceVarNames: string[] = [];

  directiveBlock
    .find(j.MemberExpression, { object: { name: "$scope" } })
    .forEach((p: any) => {
      return htmlReplaceVarNames.push(p.value.property.name);
    });

  directiveBlock
    .find(j.MemberExpression, { object: { name: "scope" } })
    .forEach((p: any) => {
      const propertyName: string = p.value.property.name;
      if (!htmlReplaceVarNames.includes(propertyName)) {
        return htmlReplaceVarNames.push(propertyName);
      }
    });

  const scopeProperty = directiveBlock.find(j.ObjectProperty, {
    key: { name: "scope" },
  });

  const scopeNode = scopeProperty.at(0).get(0).node;

  scopeNode.value.properties.forEach((p: ObjectProperty) => {
    const propertyName: string = p.key.name;
    if (!htmlReplaceVarNames.includes(propertyName)) {
      return htmlReplaceVarNames.push(propertyName);
    }
  });

  const templateNode = directiveFn
    .find(j.ObjectProperty, {
      key: { name: "template" },
    })
    .at(0)
    .get(0).node;

  const linkFn = directiveBlock.find(j.ObjectProperty, {
    key: { name: "link" },
  });

  assertOne(linkFn);

  linkFn
    .find(j.Identifier, { name: "scope" })
    .replaceWith(j.identifier("this"));

  const ctrlFn = directiveBlock.find(j.ObjectProperty, {
    key: { name: "controller" },
  });

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

  const directiveName = directiveFn.get(0).node.id.name;
  const compCtrlClassName: string = directiveName + "Controller";
  const compCtrlClassDec = j.classDeclaration(
    j.identifier(compCtrlClassName),
    j.classBody([
      j.methodDefinition(
        "method",
        j.identifier("$onInit"),
        j.functionExpression(
          null,
          [],
          j.blockStatement([...ctrlNonFunExpressions])
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

  // scope -> bindgins
  // controller -> Utworzony wcześniej kontroler
  // template
  const componentDefObjectExpr: ObjectExpression = j.objectExpression([
    j.objectProperty(j.identifier("bindings"), scopeNode.value),
    j.objectProperty(
      j.identifier("controller"),
      j.identifier(compCtrlClassName)
    ),
    j.objectProperty(j.identifier("template"), templateNode.value),
  ]);

  const compDef = j.exportDeclaration(
    false,
    j.variableDeclaration("const", [
      j.variableDeclarator(
        j.identifier(directiveName + "Component"),
        componentDefObjectExpr
      ),
    ])
  );

  directiveExport.insertBefore(compCtrlClassDec).insertAfter(compDef);

  directiveExport.remove();

  if (!!htmlReplaceVarNames.length) {
    const inFilePath = file.path.split(".").slice(0, -2).join(".") + ".in.html";
    const outHtmlFilePath =
      file.path.split(".").slice(0, -2).join(".") + ".out.html";

    const execCommandString =
      'sed -E "s/(' +
      htmlReplaceVarNames.join("|") +
      ")/\\$ctrl.\\" +
      '1/g" ' +
      inFilePath +
      " > " +
      outHtmlFilePath;
    child_process.exec(
      execCommandString,
      (error: { message: any }, stdout: any, stderr: any) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
      }
    );
  }

  return root.toSource();
}
