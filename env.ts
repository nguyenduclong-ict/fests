import { set } from 'lodash'

export function getPriorityEnv() {
    const priorityEnv = {}
    for (const key in process.env) {
        if (process.env.hasOwnProperty(key) && /^_PO\./gi.test(key)) {
            const value = process.env[key]
            priorityEnv[key.replace('_PO.', '')] = value
            delete process.env[key]
        }
    }
    return priorityEnv
}

export function getNestedEnv(path) {
    const nested = {}
    for (const key in process.env) {
        if (
            process.env.hasOwnProperty(key) &&
            RegExp('^' + path + '.', 'gi').test(key)
        ) {
            const value = process.env[key]
            set(nested, key.replace('_PO.', ''), value)
            delete process.env[key]
        }
    }
    return nested[path]
}
