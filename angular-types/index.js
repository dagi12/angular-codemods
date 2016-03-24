export function isAngularModuleCallee(p) {
  if (!p) {
    return false;
  }

  return p.object.name === 'angular' && p.property.name === 'module';
}

export function isAngularModuleGetter(p) {
  return p.type === 'CallExpression' && isAngularModuleCallee(p.callee)
    && p.arguments.length === 1;
}

export function isAngularModuleSetter(p) {
  return p.type === 'CallExpression' && isAngularModuleCallee(p.callee)
    && p.arguments.length === 2;
}

export const isAngularModuleDefinition = p => isAngularModuleSetter(p);
export const isAngularModule = p => isAngularModuleGetter(p);

export function isAngularDependencyDefinition(p) {
  return p.type === 'CallExpression' && isAngularModule(p.callee.object) && p.arguments.length === 2;
}
