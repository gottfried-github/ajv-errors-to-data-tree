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
