# `Ajv` Errors to Data Tree
Parse `ajv` validator produced errors into the structure of the validated data. I.e., parse the error's `instancePath`s into a tree.
Example:
```javascript
// an error with {instancePath: "/a/b/c"} produces this:
const res = {
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
