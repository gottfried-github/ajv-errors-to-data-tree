function toTree(errors) {
    let fields = {node: {}}
    for (const e of errors) {
        const nodeNames = e.instancePath.split('/').filter(v => !!v.length)
        let nodes = nodeNames.reduce((_nodes, name, i) => {
            const isTerminal = nodeNames.length-1 === i
            if (!isTerminal) {
                _nodes.push(nameToNode(name, e, isTerminal))
                return _nodes
            }

            const prop = ['missingProperty', 'additionalProperty', 'propertyName'].find(k => e.params && k in e.params)
            if (!prop) {
                _nodes.push(nameToNode(name, e, isTerminal))
                return _nodes
            }

            _nodes.push(nameToNode(name, null, false))
            _nodes.push(nameToNode(e.params[prop], e, true))
            return _nodes
        }, [])

        fields = mergePath(fields, createArrayNodes(nodes))
    }

    return fields
}

function nameToNode(name, data, isTerminal) {
    if (!isNaN(Number(name))) {
        return {
            index: Number(name),
            node: isTerminal
                ? {index: Number(name), errors: [{message: data.message || null, data: data}], node: null}
                : {index: Number(name), errors: [], node: null}
        }
    } else {
        if (isTerminal) {
            return {name: name, node: {errors: [{message: data.message || null, data: data}], node: null}}
        } else {
            return {name: name, node: {errors: [], node: null}}
        }
    }
}

function createArrayNodes(nodes) {
    for (const [i, node] of nodes.entries()) {
        if (0 === i) continue
        if (nodes[i-1].node.node) throw new Error("parent node.node must be null")

        if ('index' in node) {
            nodes[i-1].node.node = []; continue
        }

        if ('name' in node) {
            nodes[i-1].node.node = {}; continue
        }

        throw new Error("node must contain either index or name")
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
            if (!Array.isArray(_root.node)) throw new Error("an array item must fit into an array")

            if (_root.node.find(_node => node.index === _node.index)) {
                _root = _root.node.find(_node => node.index === _node.index); continue
            }

            _root.node.push(node.node)
            _root = node.node
            continue
        }

        if (node.name in _root.node) {
            console.log("mergePath, node.name in _root.node, node:", node)
            _root = _root.node[node.name]; continue
        }

        _root.node[node.name] = node.node
        _root = _root.node[node.name]
    }

    return root
}

module.exports = {
    toTree,
    mergePath,
}
