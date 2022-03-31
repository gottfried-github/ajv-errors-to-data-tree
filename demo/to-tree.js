const {toTree} = require('../src/index')

function mergePathsOfNamedNodes() {
    const errors = [
        {
            instancePath: "/a/b/c"
        },
        {
            instancePath: "/a/b/d"
        }
    ]

    const tree = toTree(errors)

    console.log("mergePathsOfNamedNodes, tree", tree);

    // tree should be
    // {
    //     node: {
    //         a: {
    //             errors: [],
    //             node: {
    //                 b: {
    //                     erorrs: [],
    //                     node: {
    //                         c: {errors: [{instancePath: "/a/b/c"}], node: null},
    //                         d: {errors: [{instancePath: "/a/b/d"}], node: null},
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    return tree
}

function mergePathsWithArrItem() {
    const errors = [
        {
            instancePath: "/a/0/c"
        },
        {
            instancePath: "/a/0/d"
        }
    ]

    const tree = toTree(errors)

    console.log("mergePathsOfNamedNodes, tree", tree);

    // tree should be
    // {
    //     node: {
    //         a: {
    //             errors: [],
    //             node: [
    //                 {index: 0, errors: [], node: {
    //                     c: {errors: [{instancePath: "/a/0/c"}], node: null},
    //                     b: {errors: [{instancePath: "/a/0/d"}], node: null}
    //                 }}
    //             ]
    //         }
    //     }
    // }

    return tree
}

function mergePathsWithArrItems() {
    const errors = [
        {
            instancePath: "/a/0/0/c"
        },
        {
            instancePath: "/a/0/0/d"
        }
    ]

    const tree = toTree(errors)

    console.log("mergePathsOfNamedNodes, tree", tree);

    // tree should be
    // {
    //     node: {
    //         a: {
    //             errors: [],
    //             node: [{
    //                 index: 0, errors: [],
    //                 node: [
    //                     {index: 0, errors: [], node: {
    //                         c: {errors: [{instancePath: "/a/0/0/c"}], node: null},
    //                         d: {errors: [{instancePath: "/a/0/0/d"}], node: null}
    //                     }}
    //                 ]
    //             }]
    //         }
    //     }
    // }

    return tree
}

function paramsToTree() {
    const errors = [
        {
            instancePath: "/a/b",
            params: {
                missingProperty: "c"
            }
        },
        {
            instancePath: "/a/b/d"
        }
    ]

    const tree = toTree(errors)

    console.log("paramsToTree, tree", tree);

    // tree should be
    // {
    //     node: {
    //         a: {
    //             erorrs: [],
    //             node: {
    //                 b: {
    //                     errors: [],
    //                     node: {
    //                         c: {errors: [{instancePath: "/a/b", params: {missingProperty: "c"}}], node: null},
    //                         d: {errors: [{instancePath: "/a/b/d"}], node: null}
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    return tree
}

function samePathErrors() {
    const errors = [
        {instancePath: '/a/b', v: 'b0'},
        {instancePath: '/a/b', v: 'b1'}
    ]

    const tree  = toTree(errors)
    console.log("samePathErrors, tree", tree);

    // tree should be:
    // {
    //     node: {
    //         a: {
    //             errors: [],
    //             node: {
    //                 errors: [],
    //                 node: {
    //                     b: {
    //                         errors: [
    //                             {instancePath: '/a/b', v: 'b0'},
    //                             {instancePath: '/a/b', v: 'b1'}
    //                         ],
    //                         node: null
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }
}

function samePathErrorsWithArrItems() {
    const errors = [
        {instancePath: '/a/0', v: 'b0'},
        {instancePath: '/a/0', v: 'b1'}
    ]

    const tree  = toTree(errors)
    console.log("samePathErrorsWithArrItems, tree", tree);

    // tree should be:
    // {
    //     node: {
    //         a: {
    //             errors: [],
    //             node: {
    //                 errors: [],
    //                 node: [
    //                     {
    //                         index: 0,
    //                         errors: [
    //                             {instancePath: '/a/0', v: 'b0'},
    //                             {instancePath: '/a/0', v: 'b1'}
    //                         ]
    //                     }
    //                 ]
    //             }
    //         }
    //     }
    // }
}

function multipleLevelsErrors() {
    // /a/b, /a/b/c

    const errors = [
        {instancePath: '/a/b'},
        {instancePath: '/a/b/c'}
    ]

    const tree  = toTree(errors)
    console.log("multipleLevelsErrors, tree", tree);

    // tree should be:
    // {
    //     node: {
    //         a: {
    //             errors: [], node: {
    //                 b: {
    //                     errors: [{instancePath: '/a/b'}], node: {
    //                         c: {
    //                             errors: [{instancePath: '/a/b/c'}], node: null
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    return tree
}

function conflictingNodes() {
    // /a/b/c, /a/0/d; /a/0/c, /a/b/d
}

function emptyNodeName() {
    // ///, /a//c
}

module.exports = {
    mergePathsOfNamedNodes, mergePathsWithArrItem, mergePathsWithArrItems,
    paramsToTree,
    samePathErrors, samePathErrorsWithArrItems,
    multipleLevelsErrors,
}
