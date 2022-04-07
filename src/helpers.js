function _traverseTree(tree, traverseTree, cb) {
    // console.log("_traverseTree, tree:", tree);
    if (null === tree.node) return
    if ('object' !== typeof tree.node) throw new TypeError("tree.node must either be an array or an object")

    if (Array.isArray(tree.node)) {
        tree.node.forEach(node => {
            // console.log("_traverseTree, tree.node["+node.index+"], node:", node);
            traverseTree(node, traverseTree, cb)
        })

        return
    }

    Object.keys(tree.node).forEach((k) => {
        // console.log("_traverseTree, tree.node."+k+", node:", tree.node[k]);
        if (tree.node[k].errors.length) {
            tree.node[k].errors = tree.node[k].errors.reduce((_errors, e, i) => {
                if (!cb) {
                    _errors.push(e); return _errors
                }

                const res = cb(e, k, tree.node)

                if (undefined === res) {
                    _errors.push(e); return _errors
                }

                if (null === res) {
                    return _errors
                }

                _errors.push(res)
                return _errors
            }, [])

            return
        }

        traverseTree(tree.node[k], traverseTree, cb)
    })
}

function traverseTree(tree, cb) {
    if (cb && 'function' !== typeof cb) throw new TypeError("cb must be a function")
    return _traverseTree(tree, _traverseTree, cb)
}

export {traverseTree}
