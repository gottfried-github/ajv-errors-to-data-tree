# `Ajv` Errors to Data Tree
Parse `ajv` validator produced errors into the structure of the validated data. I.e., parse the error's `instancePath`s into a tree.
Example:
```javascript
// an error with {instancePath: "/a/b/c"} produces this:
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
See more examples.

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

// access errors following the structure of the data, e.g.: errorsTree.node.obj.node.num
```

# More examples
Demos of these examples can be found in `./demo/to-tree.js`
## Basic
**/a/b/c, /a/b/d**
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
**/a/0/0/b, /a/0/0/c**
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
The errors for the `required`, `additionalProperty` and `propertyNames` keywords (among others) will have their `instancePath` set to the path of the instance that should(n't) contain the properties. But `toTree` will attach these errors to the nodes, corresponding to the properties themselves.

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
`toTree` does this by using the `params` property in the errors, which specify the name of the property which violated the rule.
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
