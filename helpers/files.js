import deepAssign from 'deep-assign';

export function loadData(data) {
  const lines = data.split('\n');

  return lines.reduce((obj, line) => {
    const [ module, type, name, path ] = line.split(':');

    return deepAssign({}, obj, {
      [module]: {
        [type]: {
          [name]: path
        },
      },
    });
  }, {});
}

export function flattenTree(tree) {
  return Object.keys(tree).reduce((flat, module) => {
    return flat.concat( Object.keys(tree[module]).reduce((types, type) => {
      return types.concat(Object.keys(tree[module][type]).map(name => {
        return { module, type, name, path: tree[module][type][name] };
      }));
    }, []));
  }, []);
}

export function serializeDependency({ module, type, name, path }) {
  return `${module}:${type}:${name}:${path}`;
}

export function serializeTree(tree) {
  return flattenTree(tree).map(serializeDependency).join('\n');
}

export function addToTree(tree, { module, type, name, path }) {
  return deepAssign(tree, {
    [module]: {
      [type]: {
        [name]: path,
      },
    },
  });
}
