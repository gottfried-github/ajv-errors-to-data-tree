function toTree(errors) {
    const fields = {}
    for (const e of errors) {
        const nodeNames = e.instancePath.split('/').filter(v => !!v.length)
        const nodes = namesToNodes(nodeNames)
        const nodesLinked = linkNodes([...nodes].reverse())

        console.log("toTree, nodesLinked:", nodesLinked);
        nodesLinked.reverse()

        fields[nodesLinked[0].name] = nodesLinked[0]
    }

    return fields
}

function namesToNodes(names) {
    return names.map(name => {
        if (!isNaN(Number(name))) {
            return {
                index: Number(name),
                node: 0 === names.length
                    ? {message: e.message || null, data: e}
                    : {}
            }
        } else {
            if (0 === names.length) {
                return {name: name, node: {message: e.message || null, data: e}}
            } else {
                return {name: name, node: {}}
            }
        }
    })
}

function linkNodes(nodes) {
    for (const [i, node] of nodes.entries()) {
        if ('index' in node) {
            if (nodes.length-1 === i) throw new Error("an array item node can't be a root node")

            if (!Array.isArray(nodes[i+1].node)) {
                nodes[i+1].node = []
            }

            nodes[i+1].node.push(node)
        }

        if (node.name) {
            if (nodes.length-1 === i) {
                continue
            }

            nodes[i+1].node[node.name] = node
        }

        if (nodes.length-1 === i) {
            if (node.index) throw new Error()
            continue
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
