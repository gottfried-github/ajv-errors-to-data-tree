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

module.exports = {toTree}
