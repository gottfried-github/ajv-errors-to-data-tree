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
