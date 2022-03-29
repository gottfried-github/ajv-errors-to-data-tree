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

# Multiple errors on the same path
A case like this seems to be possible: `[
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

# Merging paths
Consider these paths: `/a/b/c/`, `/a/b/d/e`, `/a/b/f`. Each of them specify nodes of the `b` node. (Here are some more examples with array items: `/a/0/b`, `/a/0/c/d`, `/a/0/e`).
In the algorithm, I go through each of the paths and turn them into objects. So, going through `/a/b/c/` will result in `{a: {b: {c: {}}}}`. Going through `/a/b/d/e` will produce `{a: {b: {d: {e: {}}}}}`. At the moment, the algorithm works in a way that will overwrite the former by the latter (if the former is processed before the latter): it will overwrite the `{b: {c: {}}}` in the former by the `{b: {d: {e: {}}}}` in the latter. However, the desired result would be this: `{a: {b: {
    c: {},
    d: {e: {}}
}}}` - i.e., the merger of the two paths.
