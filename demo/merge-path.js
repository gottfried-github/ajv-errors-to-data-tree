const {mergePath} = require('../src/index')

function namedNodes() {
    // /a/b/c, /a/b/d
    const root = mergePath({a: {b: {c: {v: 'c'}}}}, [{name: 'a', node: {name: 'b', node: {name: 'd', node: {v: 'd'}}}}, {name: 'b', node: {name: 'd', node: {v: 'd'}}}, {name: 'd', node: {v: 'd'}}])
    // root should be:
    // {
    //     a: {
    //         b: {
    //             c: {v: 'c'},
    //             d: {v: 'd'}
    //         }
    //     }
    // }
}

function arrayItemSingleLevel() {
    // /a/0/c, /a/0/d
    const _root = {a: [{index: 0, node: {c: {v: 'c'}}}]}
    const path = [{name: 'a', node: [{index: 0, node: {d: {v: 'd'}}}]}, {index: 0, node: {d: {v: 'd'}}}, {name: 'd', node: {v: 'd'}}]

    const root = mergePath(_root, path)

    // root should be:
    // {
    //     a: [
    //         {index: 0, node: {
    //             c: {v: 'c'},
    //             d: {v: 'd'}
    //         }}
    //     ]
    // }

    return root
}

function arrayItemMultipleLevels() {
    // /a/0/0/b, /a/0/0/c
    const _root = {a: [{index: 0, node: [{index: 0, node: {b: {v: 'b'}}}]}]}
    const path = [{name: 'a', node: [{index: 0, node: [{index: 0, node: {name: 'c', node: {v: 'c'}}}]}]}, {index: 0, node: [{index: 0, node: {name: 'c', node: {v: 'c'}}}]}, {index: 0, node: {name: 'c', node: {v: 'c'}}}, {name: 'c', node: {v: 'c'}}]

    const root = mergePath(_root, path)

    // root should be:
    // {
    //     a: [{
    //             index: 0,
    //             node: [{
    //                 index: 0,
    //                 node: {
    //                     b: {v: 'b'},
    //                     c: {v: 'c'}
    //                 }
    //             }]
    //     }]
    // }

    return root
}

function invalidInput() {
    // /a/0/0/b, /a/0/0/c
    const _root = {a: [{index: 0, node: [{index: 0, node: {v: 'b'}}]}]}
    const path = [{name: 'a', node: [{index: 0, node: [{index: 0, node: {v: 'c'}}]}]}, {index: 0, node: [{index: 0, node: {v: 'c'}}]}, {index: 0, node: {v: 'c'}}]

    const root = mergePath(_root, path)

    // root is this (which is not necessarily the desirable result, although perhaps the given input is not valid):
    {
        a: [{
                index: 0,
                node: [{
                    index: 0,
                    node: {v: 'b'}
                }]
        }]
    }

    return root
}

module.exports = {
    namedNodes, arrayItemSingleLevel, arrayItemMultipleLevels,
    invalidInput
}
