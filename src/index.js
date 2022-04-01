function toTree(errors, customizeError) {
    if (customizeError && "function" !== typeof customizeError) throw new TypeError('customizeError must be a function')

    let fields = null
    for (const e of errors) {
        const nodeNames = e.instancePath.split('/')

        // leading slash produces an empty string when using String.split. E.g.,
        // '/a/b/c'.split('/') is ['', 'a', 'b', 'c']
        if (0 === nodeNames[0].length) nodeNames.splice(0, 1)

        let nodes = nodeNames.reduce((_nodes, name, i) => {
            const isTerminal = nodeNames.length-1 === i
            if (!isTerminal) {
                _nodes.push(_nameToNode(name, e, isTerminal, customizeError))
                return _nodes
            }

            const prop = ['missingProperty', 'additionalProperty', 'propertyName'].find(k => e.params && k in e.params)
            if (!prop) {
                _nodes.push(_nameToNode(name, e, isTerminal, customizeError))
                return _nodes
            }

            _nodes.push(_nameToNode(name, null, false, customizeError))
            _nodes.push(_nameToNode(e.params[prop], e, true, customizeError))
            return _nodes
        }, [])

        if (!fields) fields = 'index' in nodes[0] ? {node: []} : {node: {}}
        fields = _mergePath(fields, _createArrayNodes(nodes))
    }

    return fields
}

function _nameToNode(name, data, isTerminal, customizeError) {
    // see 1/2 in Invalid input handling in `toTree`
    if (0 === name.length) throw new Error("node name must be non-empty")
    return isTerminal
        ? !isNaN(Number(name))
            ? {index: Number(name), node: {index: Number(name), errors: [customizeError ? customizeError(data) : {message: data.message || null, data: data}], node: null}}
            : {name: name, node: {errors: [customizeError ? customizeError(data) : {message: data.message || null, data: data}], node: null}}
        : !isNaN(Number(name))
            ? {index: Number(name), node: {index: Number(name), errors: [], node: null}}
            : {name: name, node: {errors: [], node: null}}
}

function _createArrayNodes(nodes) {
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
function _mergePath(root, path) {
    let _root = root

    for (const node of path) {
        console.log("mergePath - node, path, _root:", node, path, _root);

        if (null === _root.node) _root.node = 'index' in node ? [] : {}
        if ('index' in node) {
            // see 2. in Invalid input handling in `toTree`
            if (!Array.isArray(_root.node)) throw new Error("the parent of an array item node must be an array")

            const _node = _root.node.find(_node => node.index === _node.index)
            if (_node) {
                if (node.node.errors.length) _node.errors = [..._node.errors, ...node.node.errors]
                _root = _node; continue
            }

            _root.node.push(node.node)
            _root = node.node
            continue
        }

        if (typeof _root.node !== "object" || Array.isArray(_root.node) || null === _root.node) throw new Error("the parent of a named node must be an object")

        if (node.name in _root.node) {
            if (node.node.errors.length) _root.node[node.name].errors = [..._root.node[node.name].errors, ...node.node.errors]
            console.log("mergePath, node.name in _root.node, node:", node)
            _root = _root.node[node.name]; continue
        }

        _root.node[node.name] = node.node
        _root = _root.node[node.name]
    }

    return root
}

export {
    toTree,
    _mergePath,
}
