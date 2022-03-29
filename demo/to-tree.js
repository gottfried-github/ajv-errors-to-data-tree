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

    console.log("mergePathsOfNamedNodes, tree", tree);

    return tree
}

module.exports = {
    mergePathsOfNamedNodes, mergePathsWithArrItem, mergePathsWithArrItems, paramsToTree
}
