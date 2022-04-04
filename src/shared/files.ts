import deepAssign from "deep-assign";

export function loadData(data: string) {
  const lines = data.split("\n");

  return lines.reduce((obj: any, line: any) => {
    const [module, type, name, path] = line.split(":");

    if (!path) {
      return obj;
    }

    return deepAssign({}, obj, {
      [module]: {
        [type]: {
          [name]: path,
        },
      },
    });
  }, {});
}

export function flattenTree(tree: {
  [x: string]: { [x: string]: { [x: string]: any } };
}) {
  return Object.keys(tree).reduce((flat, module) => {
    return flat.concat(
      Object.keys(tree[module]).reduce((types, type) => {
        return types.concat(
          Object.keys(tree[module][type]).map((name) => {
            return { module, type, name, path: tree[module][type][name] };
          })
        );
      }, [])
    );
  }, []);
}

export function serializeDependency({ module, type, name, path }: any) {
  return `${module}:${type}:${name}:${path}`;
}

export function serializeTree(tree: any) {
  return flattenTree(tree).map(serializeDependency).join("\n");
}

export function addToTree(tree: any, { module, type, name, path }: any) {
  return deepAssign(tree, {
    [module]: {
      [type]: {
        [name]: path,
      },
    },
  });
}
