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

            // if node is terminal and it has no errors, remove it from the parent node
            if (0 === tree.node[k].errors.length && !tree.node[k].node) delete tree.node[k]

            return
        }

        traverseTree(tree.node[k], traverseTree, cb)
    })
}

function traverseTree(tree, cb) {
    if (cb && 'function' !== typeof cb) throw new TypeError("cb must be a function")
    return _traverseTree(tree, _traverseTree, cb)
}

function _mergeErrors(target, source, mergeErrors) {
    if (null === source.node) return
    if ('object' !== typeof target.node || 'object' !== typeof source.node) throw new TypeError("tree.node must either be an array or an object")

    if (!(!(Array.isArray(target.node) && Array.isArray(source.node)) || (Array.isArray(target.node) && Array.isArray(source.node)))) throw new Error("node types don't match")

    if (source.errors.length) target.errors = [...target.errors, ...source.errors]

    if (Array.isArray(target.node)) {
        if (target.node.length !== source.node.length) throw new Error("array nodes length doesn't match")

        target.node.forEach((node, i) => {
            // console.log("_traverseTree, tree.node["+node.index+"], node:", node);
            mergeErrors(node, source.node[i], mergeErrors)
        })

        return
    }

    Object.keys(source.node).forEach(k => {
        // console.log("_mergeErrors: source.node k, target.node:", k, target.node);
        if (!(k in target.node)) target.node[k] = {errors: [], node: null}
        // console.log("_mergeErrors, source.node k - target.node:", target.node);

        target.node[k].errors.push(...source.node[k].errors)

        mergeErrors(target.node[k], source.node[k], mergeErrors)
    })
}

function mergeErrors(target, source) {
    return _mergeErrors(target, source, _mergeErrors)
}

export {traverseTree, mergeErrors}
