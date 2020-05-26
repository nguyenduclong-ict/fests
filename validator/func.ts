import * as _ from 'lodash'

export function string(v, p) {
    if (typeof v !== 'string') {
        return `{${p}} must be a string`
    }
    return
}
export function number(v, p) {
    if (typeof v !== 'number') {
        return `{${p}} must be a number`
    }
    return
}
export function object(v, p) {
    if (!_.isObject(v)) {
        return `{${p}} must be a object`
    }
    return
}
export function array(v, p) {
    if (!_.isArray(v)) {
        return `{${p}} must be an array`
    }
    return
}
export function date(v, p) {
    if (!_.isDate(v)) {
        return `{${p}} must be a date`
    }
    return
}
export function min(minValue) {
    return function (v, p) {
        return [
            number(v, p),
            Number(v) < Number(minValue) ? `{${p}} min is ${minValue}` : null,
        ].filter((e) => !!e)
    }
}
export function max(maxValue) {
    return function (v, p) {
        return [
            number(v, p),
            Number(v) < Number(maxValue) ? `{${p}} max is ${maxValue}` : null,
        ].filter((e) => !!e)
    }
}
export function minLength(minValue) {
    return function (v, p) {
        return [
            !(typeof v === 'string' || _.isArray(v))
                ? `{${p}} must be a string or array to check length`
                : null,
            v.length < minValue ? `{${p}} min is ${minValue}` : null,
        ].filter((e) => !!e)
    }
}

export function maxLength(maxValue) {
    return function (v, p) {
        return [
            !(typeof v === 'string' || _.isArray(v))
                ? `{${p}} must be a string or array to check length`
                : null,
            v.length > maxValue ? `{${p}} max is ${maxValue}` : null,
        ].filter((e) => !!e)
    }
}

export function inList(...values) {
    return function (v, p) {
        if (values.every((val) => val !== v)) {
            return `{${p}} not match any value in list`
        }
    }
}

export function equal(value) {
    return function (v, p) {
        if (value !== v) {
            return `{${p}} must equal to ${value}`
        }
    }
}

export function all(...checks) {
    return function (v, p) {
        return checks.map((c) => c(v, p)).filter((e) => !!e)
    }
}

export function any(...checks) {
    return function (v, p) {
        return checks.map((c) => c(v, p)).find((e) => !!e)
    }
}

export function check(schema, data, path = '', errors = []) {
    // tslint:disable-next-line: forin
    for (const key in schema) {
        // function check
        const p = [path, key].filter((e) => !!e).join('.')
        const c = schema[key]
        if (typeof c !== 'function') {
            // if not is function check, check deep
            check(c, _.get(data, key), p, errors)
        } else {
            // if is function check
            errors.push(c(_.get(data, key), p))
        }
    }
    return _.uniq(_.compact(_.flattenDeep(errors)))
}

export function checkAny(schema) {}

/**
 * check v at leatest is instance of types
 * @param v variable
 * @param types type for check
 */
function is(v, ...types) {
    return types.some((t) => v instanceof t)
}
