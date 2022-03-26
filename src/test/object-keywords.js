const Ajv = require('ajv')
const ajv = new Ajv({allErrors: true, strictRequired: true})

const {toTree} = require('../index.js')

function requiredAndAdditionalProperties() {
    const validateObj = ajv.compile({
        type: "object",
        properties: {
            obj: {
                type: "object", properties: {
                    a: {type: "string", minLength: 10}
                },
                required: ['a'], additionalProperties: false
            },
        }
    })

    const data = {
        obj: {b: 5}
    }

    validateObj(data)

    return {
        validateObj, data,
        tree: toTree(validateObj.errors)
    }
}

module.exports = {requiredAndAdditionalProperties}
