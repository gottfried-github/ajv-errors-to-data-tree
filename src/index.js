function toTree(errors) {
    let fields = {}
    for (const e of errors) {
        const nodeNames = e.instancePath.split('/').filter(v => !!v.length)
        const nodes = namesToNodes(nodeNames, e)

        fields = mergePath(fields, createArrayNodes(nodes))
    }

    return fields
}

function namesToNodes(names, data) {
    return names.map((name, i) => {
        if (!isNaN(Number(name))) {
            return {
                index: Number(name),
                node: names.length-1 === i
                    ? {message: data.message || null, data: data}
                    : {}
            }
        } else {
            if (names.length-1 === i) {
                return {name: name, node: {message: data.message || null, data: data}}
            } else {
                return {name: name, node: {}}
            }
        }
    })
}

function createArrayNodes(nodes) {
    for (const [i, node] of nodes.entries()) {

        if ('index' in node) {
            if (0 === i) continue

            nodes[i-1].node = []
        }
    }

    return nodes
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

module.exports = {
    toTree,
    namesToNodes, linkNodes,
    mergePath,
}
