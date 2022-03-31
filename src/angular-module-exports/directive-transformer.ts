import { API, Collection, FileInfo, FunctionDeclaration } from 'jscodeshift';

export const parser = "babel";

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;

  // Weź ostatnią Funkcje w pliku
  const exportedFunctions: Collection<FunctionDeclaration> = j(file.source).find(j.FunctionDeclaration);
  const dirctiveFn = exportedFunctions.at(-1);



  const fnGroup = [j.ArrowFunctionExpression, j.FunctionExpression]

  // Zgrupuj dependency

  const directiveBlock = dirctiveFn
    .find(j.BlockStatement)
    .find(j.ReturnStatement)
    .find(j.ObjectExpression)

  // Znajdź isolated scope
  const scopeDeclaration =
    directiveBlock
      .find(j.Property, (path: any) => {
        return path.key && path.key.name === 'scope';
      })

  // Znajdź link function
  const linkFn = directiveBlock
    .find(j.Property, (path: any) => {
      return path.key && path.key.name === 'link';
    })

  // Znajdź controller
  const ctrlFn = directiveBlock
    .find(j.Property, (path: any) => {
      return path.key && path.key.name === 'controller';
    })

  // Znajdź template
  const template = directiveBlock
    .find(j.Property, (path: any) => {
      return path.key && path.key.name === 'template';
    })

  // Zgrupuj funkcję
  const fnDeclarationInLink = linkFn.find(j.FunctionDeclaration)
  const memberFns = linkFn.find(j.AssignmentExpression, {
    left: {
      type: "MemberExpression"
    },
    right: {
      type: "FunctionExpression",
    }
  });
  const arrowFns = linkFn.find(j.AssignmentExpression, {
    left: {
      type: "MemberExpression"
    },
    right: {
      type: "ArrowFunctionExpression",
    }
  });

  // Zgrupuj zwykłe expression
  const newVariableName = linkFn;

  // Znajdź controller
  // Zgrupuj dependency
  // Zgrupuj funkcję
  // Zgrupuj zwykłe expression

  // Utwórz klasę kontrolera
  // Nazwa z directive
  // dependency do constructora annotacja


  // Utwórz stałą z nazwą  directive,
  // scope -> bindgins
  // controller -> Utworzony wcześniej kontroler
  // template

  return dirctiveFn
    .forEach((path) => {
      // j(path).replaceWith(
      //   j.identifier(path.node.name.split("").reverse().join(""))
      // );
    })
    .toSource();
}
