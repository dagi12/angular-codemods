import { API, FileInfo } from "jscodeshift";

export const parser = "babel";

export default (fileInfo: FileInfo, api: API) => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const namedImportName = root
    .find(j.VariableDeclarator, {
      init: {
        type: "CallExpression",
      },
    })
    .get().node.id.name;

  return j(fileInfo.source)
    .find(j.CallExpression, {
      callee: { name: "require" },
    })
    .filter((p) => {
      const args: any = p.value.arguments;
      return args.length === 1 && args[0].value === "./calc";
    })
    .replaceWith((path) =>
      j.memberExpression(path.value, j.identifier(namedImportName))
    )
    .toSource();
};
