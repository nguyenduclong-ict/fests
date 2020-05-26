import { Request, Response, NextFunction } from 'express'
import { check } from './func'
import CustomError from '../error/custom-error'

export default function (schema: any, target: 'query' | 'body' | 'params') {
    return function handle(req: Request, res: Response, next: NextFunction) {
        const data = req[target]
        const errors = check(schema, data)
        if (errors.length) {
            return next(
                new CustomError({ message: errors.join('\n'), code: 422 })
            )
        }
        next()
    }
}
