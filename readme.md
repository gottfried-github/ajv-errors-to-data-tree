# Parsing the ajv errors into an hierarchical structure
1. Example.
    * `instancePath: '/a/b/c/'`
    * parsed object: `{
        a: {
            b: {
                c: {}
            }
        }
    }`

2. Example.
    * `instancePath: '/a/0/c'`
    * parsed object: `{
        a: [{
            index: 0,
            node: {c: {}}
        }]
    }`

3. Example.
    * `instancePath: '/a/0/1/c'`
    * parsed object: `{
        a: [{
            index: 0,
            node: [{
                index: 1,
                node: {c: {}}
            }]
        }]
    }`

# Invalid input handling in `toTree`
What invalid input is `toTree` vulnerable to?
    1. `instancePath` not conforming to the format of a path.
    2. conflicting node specifications in `instancePath`s of different errors. For example, `/a/0/b`, `/a/c/d`: the `a` node according to the former must be an array, but according to the latter - an object.
    3. 

# JSON schema standard
This code handles errors for the `draft-7` standard. For example, in the latest standard, there's no `additionalProperties` keyword, whereas it's present in the `draft-7` spec.

# Multiple errors with the same `instancePath`
Currently, `toTree` seems to only include in the returned tree the last occuring error of those with the same `instancePath` in the given array of errors. For example, with these errors: `[
    {
        instancePath: '/obj',
        schemaPath: '#/properties/obj/required',
        keyword: 'required',
        params: { missingProperty: 'a' },
        message: "must have required property 'a'"
    },
    {
        instancePath: '/obj',
        schemaPath: '#/properties/obj/additionalProperties',
        keyword: 'additionalProperties',
        params: { additionalProperty: 'b' },
        message: 'must NOT have additional properties'
    }
]`, the tree will be this: `{
  obj: {
    message: 'must NOT have additional properties',
    data: {
      instancePath: '/obj',
      schemaPath: '#/properties/obj/additionalProperties',
      keyword: 'additionalProperties',
      params: [Object],
      message: 'must NOT have additional properties'
    }
  }
}`. In this specific example, I might be able to mitigate the problem by using the `params` prop of the errors to specify the concrete fields that violate the rules.
But, are there cases where multiple validation errors are possible for one and the same `instancePath`?
1. Multiple errors with the same `instancePath` but keywords for different types aren't possible.
2. Within one and the same type, multiple errors with different keywords are possible in (at least) these cases:
    1. For type `object`:
        1. Both `minProperties` and `maxProperties` can be present together with the other keywords (but not one together with the other).

## Multiple errors on the same path
1. A case like this seems to be possible: `[
    {
        instancePath: '/obj',
        keyword: 'required',
        params: {missingProperty: 'a'}
    },
    {
        instancePath: '/obj',
        keyword: 'maxProperties',
        params: {limit: 2}
    }
]`. Here, the first error would be at `{
    obj: {a: {data: {keyword: 'required', ...}, ...}}
}`, and the second would be `{
    obj: {data: {keyword: 'maxProperties', ...}, ...}
}`. To handle a case like this, the format could be: `{
    obj: {
        errors: [{data: {keyword: 'maxProperties', ...}, ...}],
        node: {a: {data: {keyword: 'maxProperties', ...}, ...}}
    }
}`. This format could also handle multiple errors for a sigle `instancePath`.
2. Another example, where multiple errors are on the same path and the `params` property doesn't offer additional level: `[
{
    instancePath: '/obj',
    keyword: 'format',
    params: {format: string}
},
{
    instancePath: '/obj',
    keyword: 'maxProperties',
    params: {limit: 2}
}
]`. Here, both errors are: `{
    obj: {data: {keyword: 'format', ...}}
}` and `{
    obj: {data: {keyword: 'maxProperties', ...}}    
}`. The format, suggested in `1.` would handle this in the following manner: `{
    obj: {
        errors: [
            {data: {keyword: 'format', ...}},
            {data: {keyword: 'maxProperties', ...}}
        ],
        node: null
    }
}`.
The only cases when `instancePath` is the same but errors end up at different nodes (like in the example in `1.`) are when `params` is either `missingProperty`, `additionalProperty` or `propertyName`: see https://ajv.js.org/api.html#error-parameters .

# Merging paths
Consider these paths: `/a/b/c/`, `/a/b/d/e`, `/a/b/f`. Each of them specify nodes of the `b` node. (Here are some more examples with array items: `/a/0/b`, `/a/0/c/d`, `/a/0/e`).
In the algorithm, I go through each of the paths and turn them into objects. So, going through `/a/b/c/` will result in `{a: {b: {c: {}}}}`. Going through `/a/b/d/e` will produce `{a: {b: {d: {e: {}}}}}`. At the moment, the algorithm works in a way that will overwrite the former by the latter (if the former is processed before the latter): it will overwrite the `{b: {c: {}}}` in the former by the `{b: {d: {e: {}}}}` in the latter. However, the desired result would be this: `{a: {b: {
    c: {},
    d: {e: {}}
}}}` - i.e., the merger of the two paths.
## How `mergePath` works
The `path` array represents a directed path: each item of the array represents a node and the order of the items represents the edges - edges exist between immediate sibling items in the direction from the first item to the last. So, the path can be treated as a branch of a tree: where the first node is the root node and the following nodes are it's descendants, single node for each level.
It compares levels of `root` and `path`, in descending order: from the root level to the descendants. It merges the coinciding parts of `path` and `root` and attaches the remainder of `path`, if any, to `root`.

<!-- If the branch in `path` is deeper than the corresponding branch in `root`, it will append the remainder of the branch from `path` to `root`. -->

<!-- At each level, if a node from `path` exists in `root`, it proceeds to the next level on that branch `*1`; if the node doesn't exist, it appends it to the branch and proceeds to the next level. -->

`\*1` possibly, attaching errors from the node in `path` to the one in `root`

If a node in `path` is an array item, and the parent node in `root` exists and is not an array, `mergePath` will throw.

<!-- At each level, if a node from `path` doesn't exist in `root`, it adds the node to `root` and proceeds to the next level via that node. -->

<!-- It compares nodes at each of the levels in the given `root` and `path`:

each item of the array is connected to the next one, in the direction from the first item to the last.

it treats `path` array as a directed path of nodes. -->


It treats the given `path` array as a directed path, in the descending order: the first node in the array is the root node, the second is it's child and so on. It iterates the `path` starting from the root node and .
It parses the given `root` object starting at the root level.
