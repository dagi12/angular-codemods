import { API, FileInfo } from "jscodeshift";

export const parser = "babel";

export default (fileInfo: FileInfo, api: API) => {
  const j = api.jscodeshift;
  const namedImportName = j(fileInfo.source)
    .find(j.VariableDeclarator, {
      init: {
        type: "CallExpression",
      },
    })
    .get().value.id.name;

  return j(fileInfo.source)
    .find(j.CallExpression, {
      callee: { name: "require" },
    })
    .replaceWith((path) =>
      j.memberExpression(path.value, j.identifier(namedImportName))
    )
    .toSource();
};
