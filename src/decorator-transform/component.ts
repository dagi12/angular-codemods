import { ExpressionKind } from "ast-types/gen/kinds";
import {
  API,
  ClassBody,
  ClassProperty,
  Collection,
  ExportNamedDeclaration,
  FileInfo,
  JSCodeshift,
  ObjectProperty,
  Options,
  StringLiteral,
} from "jscodeshift";
import { default as loadash } from "lodash";
import { myPlugin } from "../shared/collection-ext";
import {
  assertCodeSize,
  initialConditions,
  reassignForBuilder,
} from "../shared/search-util";

let j: JSCodeshift;

const defaultresults = {
  ngAfterViewInit: false,
  ngOnInit: false,
  template: [] as ObjectProperty[],
  bindings: [] as ObjectProperty[],
  requireProperties: [] as ObjectProperty[],
  require: [] as ObjectProperty[],
  transclude: [] as ObjectProperty[],
  controllerAs: [] as ObjectProperty[],
  cmpName: "",
  classBody: null as ClassBody,
  superClass: null as ExpressionKind,
};

function find(
  rootC: Collection,
  compExportC: Collection<ExportNamedDeclaration>
) {
  const results = loadash.merge({}, defaultresults);

  rootC.safeImportInsert(
    [j.importSpecifier(j.identifier("Component"))],
    "angular-ts-decorators"
  );

  const declaratorN = compExportC.get(0).node.declaration.declarations[0];
  results.cmpName = declaratorN.id.name;

  reassignForBuilder(compExportC, results, j.ObjectProperty, [
    "template",
    "bindings",
    "transclude",
    "controllerAs",
    "require",
  ]);

  const classPathC = rootC.find(j.ClassDeclaration);

  const tmp = classPathC.find(j.ClassBody);
  const tmp2 = rootC.find(j.ObjectProperty, {
    key: { name: "controller" },
  });
  results.classBody =
    (tmp.length && tmp.get(0).node) ||
    (tmp2.length &&
      j.classBody([
        j.methodDefinition(
          "method",
          j.identifier("ngOnInit"),
          tmp2.get(0).node.value
        ),
      ])) ||
    j.classBody([]);

  classPathC
    .find(j.Declaration, {
      key: {
        name: "$onInit",
      },
    } as any)
    .forEach((p: any) => {
      p.node.key.name = "ngOnInit";
      rootC.safeImportInsert(
        [j.importSpecifier(j.identifier("OnInit"))],
        "angular-ts-decorators"
      );
      results.ngOnInit = true;
    });

  classPathC
    .find(j.Declaration, {
      key: {
        name: "$postLink",
      },
    } as any)
    .forEach((p: any) => {
      rootC.safeImportInsert(
        [j.importSpecifier(j.identifier("AfterViewInit"))],
        "angular-ts-decorators"
      );
      p.node.key.name = "ngAfterViewInit";
      results.ngAfterViewInit = true;
    });

  results.requireProperties = compExportC
    .find(j.ObjectProperty, {
      key: { name: "require" },
    })
    .at(0)
    .paths()
    .map((p: any) => {
      rootC.safeImportInsert(
        [j.importSpecifier(j.identifier("ViewParent"))],
        "angular-ts-decorators"
      );
      return p.node.value.properties as ObjectProperty[];
    })
    .flat();

  if (results.bindings && results.bindings.length) {
    rootC.safeImportInsert(
      [
        j.importSpecifier(j.identifier("Output")),
        j.importSpecifier(j.identifier("Input")),
      ],
      "angular-ts-decorators"
    );
  }

  if (classPathC.length) {
    results.superClass = classPathC.nodes()[0].superClass;
  }

  classPathC.remove();

  return results;
}

function build(
  replacePath: Collection<ExportNamedDeclaration>,
  results: typeof defaultresults
) {
  const selectorName =
    results.cmpName.charAt(0).toLowerCase() +
    results.cmpName.slice(1).split("Component")[0];

  let propDef: ClassProperty[] = [];

  results.bindings.length &&
    (results.bindings[0].value as any).properties.forEach((v: any) => {
      const literal = v.value as StringLiteral;
      let classProp = results.classBody.body.find((val: any) => {
        return val.type === "ClassProperty" && val.key.name === v.key.name;
      }) as any;
      if (!classProp) {
        classProp = j.classProperty(j.identifier(v.key.name), null);
        propDef.push(classProp);
      }
      switch (literal.value) {
        case "&":
          {
            classProp.decorators = [
              j.callExpression(j.identifier("@Output"), []),
            ];
            if (
              !classProp.typeAnnotation ||
              classProp.typeAnnotation.typeAnnotation.type === "TSAnyKeyword"
            ) {
              classProp.typeAnnotation = j.typeAnnotation(
                j.genericTypeAnnotation(j.identifier("Function"), null)
              );
            }
          }
          break;
        case "<":
          {
            classProp.decorators = [
              j.callExpression(j.identifier("@Input"), []),
            ];
          }
          break;
        case "=": {
          classProp.decorators = [
            j.callExpression(j.identifier("@Input"), []),
            j.callExpression(j.identifier("@Output"), []),
          ];
        }
      }
    });

  const requirePathValueProperties = results.requireProperties;
  if (requirePathValueProperties) {
    requirePathValueProperties.forEach((p: any) => {
      const classProp = j.classProperty(j.identifier(p.key.name), null);

      (classProp as any).decorators = [
        j.callExpression(j.identifier("@ViewParent"), [
          j.stringLiteral(p.key.name),
        ]),
      ];

      propDef.push(classProp);
    });
  }

  results.classBody.body.unshift(...propDef);

  const compCtrlClassDec = j.classDeclaration(
    j.identifier(results.cmpName),
    results.classBody,
    results.superClass
  );

  results.ngOnInit &&
    compCtrlClassDec.implements.push(
      j.classImplements(j.identifier("OnInit")) as any
    );
  results.ngAfterViewInit &&
    compCtrlClassDec.implements.push(
      j.classImplements(j.identifier("AfterViewInit")) as any
    );

  (compCtrlClassDec as any).decorators = [
    j.decorator(
      j.callExpression(j.identifier("Component"), [
        j.objectExpression([
          j.objectProperty(
            j.identifier("selector"),
            j.stringLiteral(selectorName)
          ),
          ...results.bindings,
          ...results.require,
          ...results.transclude,
          ...results.controllerAs,
          ...results.template,
        ]),
      ])
    ),
  ];
  replacePath.get(0).node.declaration = compCtrlClassDec;
}

export default function transformer(
  fileInfo: FileInfo,
  api: API,
  options: Options
) {
  j = api.jscodeshift;
  j.use(myPlugin);
  const root = j(fileInfo.source);

  const startPath = root.find(j.ExportNamedDeclaration, {
    declaration: {
      type: "VariableDeclaration",
      kind: "const",
      declarations: [
        {
          type: "VariableDeclarator",
          id: { type: "Identifier" },
          init: {
            type: "ObjectExpression",
          },
        },
      ],
    },
  });

  const { beginCount, beginLn, mainPath } = initialConditions(
    fileInfo,
    root,
    root.find(j.ImportSpecifier, {
      imported: { name: "Component" },
    }),
    startPath
  );
  if (!mainPath) {
    return;
  }

  const results = find(root, mainPath);
  build(mainPath, results);

  assertCodeSize(beginCount, beginLn, j, root, options);
  return root.toSource();
}
