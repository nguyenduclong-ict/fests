import { Model, Document } from 'mongoose'

import {
    GetOneFunction,
    GetManyFunction,
    CreateManyFunction,
    UpdateOneFunction,
    UpdateManyFunction,
    DeleteOneFunction,
    DeleteManyFunction,
    CreateOneFunction,
    GetManyOptions,
} from './declare'
import { validatePagination } from '../query'
import CustomError from '../error/custom-error'

export class Provider {
    model: Model<Document, {}>

    constructor(model: Model<Document, {}>) {
        this.model = model
        this.getOne = getOne(model)
        this.getMany = getMany(model)
        this.createOne = createOne(model)
        this.createMany = createMany(model)
        this.updateOne = updateOne(model)
        this.updateMany = updateMany(model)
        this.deleteOne = deleteOne(model)
        this.deleteMany = deleteMany(model)

        this.list = list(this)
        this.find = find(this)
        this.findOne = findOne(this)
        this.findOneBody = findOne(this, 'body')
        this.listBody = list(this, 'body')
        this.findBody = find(this, 'body')
        this.rCreate = rCreate(this)
        this.rCreateMany = rCreateMany(this)
        this.rUpdate = rUpdate(this)
        this.rUpdateMany = rUpdateMany(this)
        this.rDelete = rDelete(this)
        this.rDeleteMany = rDeleteMany(this)
    }

    getOne: GetOneFunction
    getMany: GetManyFunction
    createOne: CreateOneFunction
    createMany: CreateManyFunction
    updateOne: UpdateOneFunction
    updateMany: UpdateManyFunction
    deleteOne: DeleteOneFunction
    deleteMany: DeleteManyFunction
    // router
    list: (req, res, next) => void
    find: (req, res, next) => void
    findOne: (req, res, next) => void
    findOneBody: (req, res, next) => void
    listBody: (req, res, next) => void
    findBody: (req, res, next) => void
    rCreate: (req, res, next) => void
    rCreateMany: (req, res, next) => void
    rUpdate: (req, res, next) => void
    rUpdateMany: (req, res, next) => void
    rDelete: (req, res, next) => void
    rDeleteMany: (req, res, next) => void
}

export function list(ctx, target = 'query') {
    return async function (req, res, next) {
        const query = req[target]
        let { sort, pagination, populates } = query
        if (typeof sort === 'string') {
            sort = JSON.parse(sort)
        }
        if (typeof pagination === 'string') {
            pagination = JSON.parse(pagination)
        }
        if (typeof populates === 'string') {
            populates = JSON.parse(populates)
        }
        pagination = pagination || {
            page: 0,
            pageSize: 10,
            disabled: false,
        }
        pagination = validatePagination(pagination)
        delete query.sort
        delete query.pagination
        delete query.populates
        const result = await ctx.getMany(query, { pagination, sort, populates })
        return res.json(result)
    }
}

export function find(ctx, target = 'query') {
    return async function (req, res, next) {
        try {
            const query = req[target]
            let { sort, populates } = query
            if (typeof sort === 'string') {
                sort = JSON.parse(query.sort)
            }
            if (typeof populates === 'string') {
                populates = JSON.parse(populates)
            }
            delete query.sort
            const result = await ctx.getMany(query, { sort, populates })
            return res.json(result)
        } catch (error) {
            next(new CustomError({ code: 500, message: error.message }))
        }
    }
}

export function findOne(ctx, target = 'query') {
    return async function (req, res, next) {
        try {
            const query = req[target]
            const result = await ctx.getOne(query)
            return res.json(result)
        } catch (error) {
            next(new CustomError({ code: 500, message: error.message }))
        }
    }
}

export function rCreate(ctx) {
    return async function (req, res, next) {
        try {
            const result = await ctx.createOne(req.body)
            return res.json(result)
        } catch (error) {
            next(new CustomError({ code: 500, message: error.message }))
        }
    }
}

export function rCreateMany(ctx) {
    return async function (req, res, next) {
        try {
            const result = await ctx.createMany(req.body)
            return res.json(result)
        } catch (error) {
            next(new CustomError({ code: 500, message: error.message }))
        }
    }
}

export function rUpdate(ctx) {
    return async function (req, res, next) {
        try {
            const result = await ctx.updateOne(req.body.query, req.body.data)
            return res.json(result)
        } catch (error) {
            next(new CustomError({ code: 500, message: error.message }))
        }
    }
}

export function rUpdateMany(ctx) {
    return async function (req, res, next) {
        try {
            const result = await ctx.updateMany(req.body.query, req.body.data)
            return res.json(result)
        } catch (error) {
            next(new CustomError({ code: 500, message: error.message }))
        }
    }
}

export function rDelete(ctx) {
    return async function (req, res, next) {
        try {
            const result = await ctx.deleteOne(req.body)
            return res.json(result)
        } catch (error) {
            next(new CustomError({ code: 500, message: error.message }))
        }
    }
}

export function rDeleteMany(ctx) {
    return async function (req, res, next) {
        try {
            const result = await ctx.deleteMany(req.body)
            return res.json(result)
        } catch (error) {
            next(new CustomError({ code: 500, message: error.message }))
        }
    }
}

// function ----------------------------------------------------
export function getOne(model: Model<Document, {}>): any {
    return (condition, populates: string[] = []) => {
        const task = model.findOne(condition)
        populates.forEach((pdata) => {
            const [path, select, match, perDocumentLimit] = pdata
                .split(':')
                .shift()
            task.populate({
                path,
                select,
                match,
                perDocumentLimit,
            })
        })
        return task
    }
}

export function getMany(model: Model<Document, {}>) {
    return async (condition, options: GetManyOptions) => {
        const defaultOptions: GetManyOptions = {
            populates: [],
            pagination: {
                disabled: true,
            },
        }
        options = { ...defaultOptions, ...options }
        const { pagination, populates, sort } = options
        if (!pagination.disabled) {
            // skip and limit
            const { page, pageSize } = pagination
            const task = model
                .find(condition)
                .skip(pageSize * page)
                .limit(pageSize)
            // Sort
            if (sort) {
                task.sort(sort)
            }
            // populates
            populates?.forEach((pdata) => {
                const [path, select, match, perDocumentLimit] = pdata.split(':')
                console.log(path, select, match, perDocumentLimit)
                task.populate({
                    path,
                    select,
                    match,
                    perDocumentLimit,
                })
            })
            const [l, count] = await Promise.all([
                task,
                model.countDocuments(condition),
            ])
            // pager
            const pager = {
                page,
                total: count,
                pageSize,
                totalPage: Math.ceil(count / pageSize),
            }
            return { data: l || [], pager }
        } else {
            // No pagination
            const task = model.find(condition)
            // populates
            populates?.forEach((pdata) => {
                const [path, select, match, perDocumentLimit] = pdata.split(':')
                task.populate({
                    path,
                    select,
                    match,
                    perDocumentLimit,
                })
            })
            // Sort
            if (sort) {
                task.sort(sort)
            }
            return task
        }
    }
}

export function updateOne(model: Model<Document, {}>) {
    return (condition, data, options?) => {
        return model.findOneAndUpdate(condition, data, {
            new: true,
            setDefaultsOnInsert: true,
            upsert: false,
            ...(options || {}),
        })
    }
}

export function updateMany(model: Model<Document, {}>) {
    return (condition, data, options?) => {
        return model.updateMany(condition, data, {
            upsert: true,
            setDefaultsOnInsert: true,
            new: true,
            ...(options || {}),
        })
    }
}

export function createOne(model: Model<Document, {}>) {
    return (doc, mode: 'create' | 'save' = 'save') => {
        if (mode === 'create') {
            return model.create(doc)
        } else if (mode === 'save') {
            return new model(doc).save()
        }
    }
}

export function createMany(model: Model<Document, {}>) {
    return (docs) => {
        return model.insertMany(docs)
    }
}

export function deleteOne(model: Model<Document, {}>) {
    return (condition) => {
        return model.deleteOne(condition)
    }
}

export function deleteMany(model: Model<Document, {}>) {
    return (condition) => {
        return model.deleteMany(condition)
    }
}

// const operators =
