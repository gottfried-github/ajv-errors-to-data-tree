const {traverseTree} = require("../src/helpers.js")

function demoTraverseTree() {
    const tree = {
        node: [
            {index: 0, errors: [], node: [
                {index: 0, errors: [], node: {a: {errors: [{v: '/0/0/a'}], node: null}}},
                {index: 1, errors: [], node: {b: {errors: [{v: '/0/1/b'}], node: null}}}
            ]},
            {index: 1, errors: [], node: {
                c: {
                    errors: [], node: {e: {errors: [{v: '/1/c/e'}], node: null}}
                },
                d: {
                    errors: [], node: {f: {errors: [{v: '/1/d/f'}], node: null}}
                }
            }}
        ]
    }

    traverseTree(tree, (e, node) => {
        console.log("demo traverseTree - e, node:", e, node)
    })

    // should log:
    // demo traverseTree - e, node: { v: '/0/0/a' } { errors: [ { v: '/0/0/a' } ], node: null }
    // demo traverseTree - e, node: { v: '/0/1/b' } { errors: [ { v: '/0/1/b' } ], node: null }
    // demo traverseTree - e, node: { v: '/1/c/e' } { errors: [ { v: '/1/c/e' } ], node: null }
    // demo traverseTree - e, node: { v: '/1/d/f' } { errors: [ { v: '/1/d/f' } ], node: null }
}

module.exports = {demoTraverseTree}
