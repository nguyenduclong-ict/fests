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
    rCreate: (req, res, next) => void
    rCreateMany: (req, res, next) => void
    rUpdate: (req, res, next) => void
    rUpdateMany: (req, res, next) => void
    rDelete: (req, res, next) => void
    rDeleteMany: (req, res, next) => void
}

export function list(ctx) {
    return async function (req, res, next) {
        let { sort, pagination } = req.query
        if (typeof sort === 'string') {
            sort = JSON.parse(sort)
        }
        if (typeof pagination === 'string') {
            pagination = JSON.parse(pagination)
        }
        pagination = pagination || {
            page: 0,
            pageSize: 10,
            disabled: false,
        }
        pagination = validatePagination(pagination)
        delete req.query.sort
        delete req.query.pagination
        const result = await ctx.getMany(req.query, { pagination })
        return res.json(result)
    }
}

export function find(ctx) {
    return async function (req, res, next) {
        let { sort } = req.query
        if (typeof sort === 'string') {
            sort = JSON.parse(req.query.pagination)
        }
        delete req.query.sort
        const result = await ctx.getMany(req.query, { sort })
        return res.json(result)
    }
}

export function rCreate(ctx) {
    return async function (req, res, next) {
        const result = await ctx.createOne(req.body)
        return res.json(result)
    }
}

export function rCreateMany(ctx) {
    return async function (req, res, next) {
        const result = await ctx.createMany(req.body)
        return res.json(result)
    }
}

export function rUpdate(ctx) {
    return async function (req, res, next) {
        const result = await ctx.updateOne(req.body.query, req.body.data)
        return res.json(result)
    }
}

export function rUpdateMany(ctx) {
    return async function (req, res, next) {
        const result = await ctx.updateMany(req.body.query, req.body.data)
        return res.json(result)
    }
}

export function rDelete(ctx) {
    return async function (req, res, next) {
        const result = await ctx.DeleteOne(req.body)
        return res.json(result)
    }
}

export function rDeleteMany(ctx) {
    return async function (req, res, next) {
        const result = await ctx.DeteleMany(req.body)
        return res.json(result)
    }
}

// function ----------------------------------------------------
export function getOne(model: Model<Document, {}>) {
    return (condition, populates: string[] = []) => {
        const task = model.findOne(condition)
        populates.forEach((field) => {
            task.populate(field)
        })
        return task.lean().exec()
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
            populates.forEach((field) => {
                task.populate(field)
            })
            const [l, count] = await Promise.all([
                task.lean().exec(),
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
            populates.forEach((field) => {
                task.populate(field)
            })
            // Sort
            if (sort) {
                task.sort(sort)
            }
            return task.lean().exec()
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
