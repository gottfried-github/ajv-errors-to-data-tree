import {toTree} from '../src/index.js'

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

function emptyInstancePathA() {
    const errors = [
        {instancePath: ''}
    ]

    const tree = toTree(errors)
    console.log(tree)

    // tree should be:
    // {
    //     errors: [{instancePath: ''}],
    //     node: null
    // }

    return tree
}

function emptyInstancePathB() {
    const errors = [
        {
            instancePath: '',
            keyword: 'required',
            params: {
                missingProperty: "a"
            }
        }
    ]

    const tree = toTree(errors)
    console.log(tree)

    // tree should be:
    // {
    //     errors: [],
    //     node: {
    //         a: {
    //             errors: [{instancePath: '', keyword: 'required', params: {missingProperty: 'a'}}]
    //         }
    //     }
    // }

    return tree
}

function emptyInstancePathC() {
    const errors = [
        {
            instancePath: '',
        },
        {
            instancePath: '',
            keyword: 'required',
            params: {
                missingProperty: "a"
            }
        }
    ]

    const tree = toTree(errors)
    console.log(tree)

    // tree should be:
    // {
    //     errors: [{instancePath: ''}],
    //     node: {
    //         a: {
    //             errors: [{instancePath: '', keyword: 'required', params: {missingProperty: 'a'}}]
    //         }
    //     }
    // }

    return tree
}

function conflictingNodesA() {
    // /a/b/c, /a/0/d

    const errors = [
        {instancePath: '/a/b/c'},
        {instancePath: '/a/0/d'}
    ]

    try {
        toTree(errors)
    } catch(e) {
        console.log("conflictingNodesA, toTree thrown - e:", e);
        // e.message should be: "the parent of an array item node must be an array"
    }
}

function conflictingNodesB() {
    // /a/0/c, /a/b/d

    const errors = [
        {instancePath: '/a/0/c'},
        {instancePath: '/a/b/d'}
    ]

    try {
        toTree(errors)
    } catch(e) {
        console.log("conflictingNodesB, toTree thrown - e:", e);
        // e.message should be: "the parent of a named node must be an object"
    }
}

function emptyNodeName() {
    // ///, /a//c
    const errors = [
        {instancePath: '/a//c'}
    ]

    try {
        toTree(errors)
    } catch(e) {
        console.log("emptyNodeName, toTree thrown - e:", e);
        // e.message should be: "node name must be non-empty"
    }
}

function customizeErrors() {
    const errors = [
        {
            instancePath: "/a/b/c"
        },
        {
            instancePath: "/a/b/d"
        }
    ]

    class CustomErrorFormat {
        constructor(data) {
            this.data = data
        }
    }

    const tree = toTree(errors, (data) => {
        return new CustomErrorFormat(data)
    })

    // tree should be
    // {
    //     node: {
    //         a: {
    //             errors: [],
    //             node: {
    //                 b: {
    //                     erorrs: [],
    //                     node: {
    //                         c: {errors: [/*instance of CustomErrorFormat*/], node: null},
    //                         d: {errors: [/*instance of CustomErrorFormat*/], node: null},
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    console.log(tree)
    return tree
}

export {
    mergePathsOfNamedNodes, mergePathsWithArrItem, mergePathsWithArrItems,
    paramsToTree,
    samePathErrors, samePathErrorsWithArrItems,
    multipleLevelsErrors,
    emptyInstancePathA, emptyInstancePathB, emptyInstancePathC,
    conflictingNodesA, conflictingNodesB,
    emptyNodeName,
    customizeErrors
}
