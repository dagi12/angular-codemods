# Transforming AngularJS applications at scale

## Debug

- Use transform tutorial task
- Run from transformer
- Respect filename convention

## How to write transformer

- first copy and analyze input to https://astexplorer.net/
- write output and analyze difference in tree
- add step by step transforming methods
- ensure you found correct nodes
- then replace them or insert in new

## Common misconceptions

- SyntaxError - you input wrong file
- don't use j.identifier to query use nested name
- don't use j.arguments
- always pass array to args
- don't forget array block on builder
- some types ara different than ASTExplorer
  - Property is ObjectProperty
- does not match type array -> inserted at wrong place try parent

## Good practices

- use get(0).node instead get().value
