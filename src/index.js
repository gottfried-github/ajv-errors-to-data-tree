function toTree(errors, customizeError) {
    if (customizeError && "function" !== typeof customizeError) throw new TypeError('customizeError must be a function')

    let fields = null
    for (const e of errors) {
        if (0 === e.instancePath.length) {
            const nodeTerminal = _handleParams(e, customizeError)
            const _node = nodeTerminal
                ? 'name' in nodeTerminal
                    ? _nameToNode('name', null, false, customizeError)
                    : _nameToNode('0', null, false, customizeError)
                : _nameToNode('name', e, true, customizeError)

            // console.log('toTree, empty instancePath, _node:', _node)

            const node = {name: null, node: _node.node}
            const nodes = nodeTerminal ? [node, nodeTerminal] : [node]

            if (!fields) fields = Array.isArray(node.node) ? {errors: [], node: []} : {errors: [], node: {}}
            fields = _mergePath(fields, _createArrayNodes(nodes))
            continue
        }

        const nodeNames = e.instancePath.split('/')

        // leading slash produces an empty string when using String.split. E.g.,
        // '/a/b/c'.split('/') is ['', 'a', 'b', 'c']
        if (0 === nodeNames[0].length) nodeNames.splice(0, 1)

        let nodes = nodeNames.reduce((_nodes, name, i) => {
            const isTerminal = nodeNames.length-1 === i
            if (!isTerminal) {
                _nodes.push(_nameToNode(name, e, isTerminal, customizeError)); return _nodes
            }

            const nodeTerminal = _handleParams(e, customizeError)
            if (!nodeTerminal) {
                _nodes.push(_nameToNode(name, e, isTerminal, customizeError))
                return _nodes
            }

            _nodes.push(_nameToNode(name, null, false, customizeError))
            _nodes.push(nodeTerminal)
            return _nodes
        }, [])

        if (!fields) fields = 'index' in nodes[0] ? {errors: [], node: []} : {errors: [], node: {}}
        fields = _mergePath(fields, _createArrayNodes(nodes))
    }

    return fields
}

function _handleParams(e, customizeError) {
    const prop = ['missingProperty', 'additionalProperty', 'propertyName'].find(k => e.params && k in e.params)
    return prop
        ? _nameToNode(e.params[prop], e, true, customizeError)
        : null
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
            if (null === node.name) throw new Error("node with name of null can only be the first node in the array")
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

    for (const [i, node] of path.entries()) {
        // console.log("mergePath - node, path, _root:", node, path, _root);

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

        if (null === node.name) {
            // this is unnecessary, since _createArrayNodes already does this check
            // if (0 !== i) throw new Error("node with name of null can only be the first node in the array")

            if (null === node.node.node) {
                if (node.node.errors.length) _root.errors = [..._root.errors, ...node.node.errors]; continue
            }

            if (!Array.isArray(node.node.node) && 'object' !== typeof node.node.node) throw new Error("the node property must be either array or an object")
            if (Array.isArray(node.node.node) && !Array.isArray(_root.node) || !Array.isArray(node.node.node) && Array.isArray(_root.node)) throw new Error("root node types don't coincide")

            if (node.node.errors.length) _root.errors = [..._root.errors, ...node.node.errors]
            continue
        }

        if (node.name in _root.node) {
            if (node.node.errors.length) _root.node[node.name].errors = [..._root.node[node.name].errors, ...node.node.errors]
            // console.log("mergePath, node.name in _root.node, node:", node)
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
