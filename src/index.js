function toTree(errors) {
    const fields = {}
    for (const e of errors) {
        const nodeNames = e.instancePath.split('/').filter(v => !!v.length)
        const nodes = []

        while (nodeNames.length) {
            const nodeName = nodeNames.shift()
            if (!isNaN(Number(nodeName))) {
                nodes.unshift({
                    index: Number(nodeName),
                    node: 0 === nodeNames.length
                        ? {message: e.message || null, data: e}
                        : {}
                })

            } else {
                if (0 === nodeNames.length) {
                    nodes.unshift({name: nodeName, node: {message: e.message || null, data: e}})
                } else {
                    nodes.unshift({name: nodeName, node: {}})
                }
            }
        }

        nodes.forEach((node, i) => {
            console.log("hierarchicalAjvToValidationErrors, nodes iteration - i, node, nodes", i, node, nodes);

            if ('index' in node) {
                if (nodes.length-1 === i) throw new Error("an array item node can't be a root node")

                if (!Array.isArray(nodes[i+1].node)) {
                    nodes[i+1].node = []
                }

                nodes[i+1].node.push(node)
            }

            if (node.name) {
                if (nodes.length-1 === i) {
                    fields[node.name] = node.node
                    return
                }

                nodes[i+1].node[node.name] = node.node
            }

            if (nodes.length-1 === i) {
                if (node.index) throw new Error()
                fields[node.name] = node.node

                return
            }
        })
    }

    return fields
}

/**
    @param {Object} root
    @param {Array} path in descending order (from ancsetors to descendants)
*/
function mergePath(root, path) {
    let _root = root

    for (const node of path) {
        console.log("mergePath - node, path, _root:", node, path, _root);
        if ('index' in node) {
            if (!Array.isArray(_root)) throw new Error("an array item must fit into an array")

            if (_root.find(_node => node.index === _node.index)) {
                _root = _root.find(_node => node.index === _node.index).node; continue
            }

            _root.push(node)
            _root = node.node
            continue
        }

        if (node.name in _root) {
            _root = _root[node.name]; continue
        }

        _root[node.name] = node.node
        _root = _root[node.name]
    }

    return root
}

function mergePathDemo00() {
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

function mergePathDemo01() {
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

module.exports = {
    toTree, mergePath,
    mergePathDemo00, mergePathDemo01
}
