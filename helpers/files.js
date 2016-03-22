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
