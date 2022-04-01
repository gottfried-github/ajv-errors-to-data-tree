# `Ajv` Errors to Data Tree
Map `ajv` errors into a tree that resembles the structure of the validated data. I.e., parse the errors' `instancePath`s into a tree.
Example:
`instancePath`: **/a/b/c**
```javascript
{
    node: {
        a: {
            errors: [],
            node: {
                b: {
                    errors: [],
                    node: {
                        c: {
                            errors: [{instancePath: "a/b/c", ...}]
                        }
                    }
                }
            }
        }
    }
}
```
See [more examples](#More-examples).

## JSONSchema standard
This package handles errors, generated for the [`draft-7` jsonschema spec](https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01), which is the [default in `ajv`](https://ajv.js.org/guide/schema-language.html#draft-07-and-draft-06).

## What it doesn't do
I haven't actually tested it thoroughly, with real errors and all the possible keywords. What I did test it with is what's in the demos. Although, in parsing the tree it relies solely on the `instancePath` property.

## Contributing
Improvement suggestions, issue reports, contributions are kindly welcome.

# Usage
## Install
```bash
npm i --save ajv ajv-errors-to-data-tree
```

## Use
```javascript
import Ajv from 'ajv'
import {toTree} from 'ajv-errors-to-data-tree'
const ajv = new Ajv({allErrors: true, strictRequired: true})

const validate = ajv.compile({
    type: 'object',
    properties: {
        obj: {
            type: 'object',
            properties: {
                num: {type: "number"},
                str: {type: "string"}
            }
            required: ['str'],
            additionalProperties: false
        }
    }
})

const badData = {
    obj: {
        num: "a string, despite the schema says this must be a number",
        c: "an additional property, which is not allowed by the schema"
    }
}

validate(badData)

const errorsTree = toTree(validate.errors)

// access errors following the structure of the data
const numErr = errorsTree.node.obj.node.num
```

## Customize Errors
```javascript
class CustomErrorFormat {
    constructor(data) {
        this.data = data
    }
}

const customErrorsTree = toTree(validate.errors, (data) => {
    return new CustomErrorFormat(data)
})

// returns true:
customErrorsTree.node.obj.node.num.errors[0] instanceof CustomErrorFormat
```

## Traverse Error Trees
**WARNING: this is a prototype, might be buggy.**
```javascript
import {traverseTree} from 'ajv-errors-to-data-tree/src/helpers.js'

traverseTree(customErrorsTree, (e, node) => {
    if (!(e instanceof CustomErrorFormat)) throw new TypeError("errors must inherit CustomErrorFormat")
})
```
demo: `demoTraverseTree` in `./src/demo/helpers.js`

# More examples
Demos of these examples can be found in `./demo/to-tree.js`
## Basic
`instancePath`s: **/a/b/c, /a/b/d**
```javascript
{
    node: {
        a: {
            errors: [],
            node: {
                b: {
                    errors: [],
                    node: {
                        c: {
                            errors: [{instancePath: "a/b/c", ...}]
                        },
                        c: {
                            errors: [{instancePath: "a/b/d", ...}]
                        }
                    }
                }
            }
        }
    }
}
```
demo: `mergePathsOfNamedNodes`

## With array items
`instancePath`s: **/a/0/0/b, /a/0/0/c**
```javascript
{
    node: {
        a: {
            errors: [],
            node: [{
                index: 0, errors: [],
                node: [
                    {index: 0, errors: [], node: {
                        c: {errors: [{instancePath: "/a/0/0/c", ...}], ...},
                        d: {errors: [{instancePath: "/a/0/0/d", ...}], ...}
                    }}
                ]
            }]
        }
    }
}
```
demo: `mergePathsWithArrItems`

## Some of the keywords for the object type
The errors for the [`required`](https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-6.5.3), [`additionalProperties`](https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-6.5.6) and [`propertyNames`](https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-6.5.8) keywords (among others) will have their `instancePath` set to the path of the instance that should(n't) contain the properties. But `toTree` will attach these errors to the nodes, corresponding to the properties themselves.

E.g., for errors:
```javascript
[
    {
        instancePath: "/a/b",
        keyword: "required",
        params: {
            missingProperty: "c"
        }
    },
    {
        instancePath: "/a/b/d"
    }
]
```

the result will be:
```javascript
{
    node: {
        a: {
            erorrs: [],
            node: {
                b: {
                    errors: [],
                    node: {
                        c: {errors: [{instancePath: "/a/b", keyword: "required", params: {missingProperty: "c"}, ...}], ...},
                        d: {errors: [{instancePath: "/a/b/d"}, ...], ...}
                    }
                }
            }
        }
    }
}
```
`toTree` does this by using the [`params` property](https://ajv.js.org/api.html#error-parameters) in the errors, which specifies the name of the property which violated the rule.

demo: `paramsToTree`

## Multiple errors for the same path
errors:
```javascript
[
    {instancePath: '/a/b', v: 'b0'},
    {instancePath: '/a/b', v: 'b1'}
]
```

output:
```javascript
{
    node: {
        a: {
            errors: [],
            node: {
                errors: [],
                node: {
                    b: {
                        errors: [
                            {instancePath: '/a/b', v: 'b0'},
                            {instancePath: '/a/b', v: 'b1'}
                        ],
                        node: null
                    }
                }
            }
        }
    }
}
```
demo: `samePathErrors`

# Bad input handling
Here are some examples of bad input that I could come up with (you can find demos in `./demo/to-tree.js`):
1. `instancePath` bad format: the value not being formatted like a path.
    If, for example, it doesn't contain slashes, than it simply be treated as a single node name. I don't do anything to handle such case.
2. Contradictions in the errors data.
    What if there's two errors for the same path, one with a keyword relating to the `number` type and another with a keyword, relating to the `string` type. `toTree` won't do anything about it, it will just push both errors to the same node.
3. `instancePath` bad format: e.g., `///`, `/a//c`. This could result in node names being empty strings. `toTree` generates exception if this happens (**demo:** `conflictingNodesA`, `conflictingNodesB`).
4. Conflicting node specifications in `instancePath`s of different errors. E.g., `/a/0/b`, `/a/c/d`: the `a` node according to the former must be an array, but according to the latter - an object. Such cases cause an exception in `toTree` (**demo:** `emptyNodeName`).
