import {traverseTree} from "../src/helpers.js"

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

    const treeBefore = JSON.stringify(tree, null, 2)
    console.log("demoTraverseTree - tree, before traversing", treeBefore)

    traverseTree(tree, (e, fieldName, parentNode) => {
        console.log("demo traverseTree - e, fieldName, parentNode:", e, fieldName, parentNode)
    })

    // should be same as treeBefore
    const treeAfter = JSON.stringify(tree, null, 2)

    // should log:
    // demo traverseTree - e, node: { v: '/0/0/a' } { errors: [ { v: '/0/0/a' } ], node: null }
    // demo traverseTree - e, node: { v: '/0/1/b' } { errors: [ { v: '/0/1/b' } ], node: null }
    // demo traverseTree - e, node: { v: '/1/c/e' } { errors: [ { v: '/1/c/e' } ], node: null }
    // demo traverseTree - e, node: { v: '/1/d/f' } { errors: [ { v: '/1/d/f' } ], node: null }

    console.log("demoTraverseTree - tree, after traversing", treeAfter)
}

function modifyErrors() {
    const tree = {
        errors: [],
        node: {
            a: {errors: [{v: '/a'}]},
            b: {errors: [{v: '/b'}]},
            c: {errors: [{v: '/c'}]}
        }
    }

    const treeBefore = JSON.stringify(tree, null, 2)

    traverseTree(tree, (e, fieldName, parentNode) => {
        if ('/a' === e.v) {
            e.modified = true
            return e
        }

        if ('/b' === e.v) return null
    })

    const treeAfter = JSON.stringify(tree, null, 2)

    console.log(treeBefore, treeAfter)
    // treeAfter should be
    // {
    //     errors: [],
    //     node: {
    //         a: {errors: [{v: '/a', modified: true}]},
    //         b: {errors: []},
    //         c: {errors: {v: '/c'}}
    //     }
    // }
    // i.e., `/a` is modified, `/b` is removed, `/c` is unchanged
}

export {demoTraverseTree, modifyErrors}
