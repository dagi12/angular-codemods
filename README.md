# Transforming AngularJS applications at scale

## Debug

- Use transform tutorial task
- Run from transformer
- Respect filename convention

## How to write transformer

- first copy and analyze input to https://astexplorer.net/
- write output and analyze difference in tree
- add step by step transforming methods (query, build)
- ensure you found correct nodes
- then replace them or insert in new
- use eslint autofixes for edge cases
- test easy case -> medium case -> complicated -> easy -> all

## Common mistakes

- SyntaxError - you input wrong file
- SyntaxError - you mixed order of jscodeshift command args, results in wrong parser
- always pass array to args
- don't forget array block on builder
- some types ara different than ASTExplorer
  - Property is ObjectProperty
- does not match type array -> inserted at wrong place try parent
- child node variables becomes undefined when parent is removed from ast tree
- don't use `j.Decorator`, `j.Property`, `*Kind` types in `j.find` method
- To run multiple files open bash run `shopt -s globstar && yarn run modules`

## Good practices

- use get(0).node instead get().value
- use closest instead parent
- naming convention
  - c - collection
  - p - nodepath
  - n - node

## Scripts

```bash
shopt -s globstar && node_modules/.bin/jscodeshift ./src/decorator-transform/**/*.directive.ts -t ./src/decorator-transform/directive.ts --extensions=*.ts --parser=ts
```

```sh
find . -name "\*.module.ts" -exec sh -c 'cp "$1" /Users/erykmariankowski/programowanie/web/angular-codemods/src/module-transform' - '{}' \;
```
