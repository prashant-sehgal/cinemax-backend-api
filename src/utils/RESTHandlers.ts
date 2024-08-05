import { Request, Response, NextFunction } from 'express'
import CatchAsync from './CatchAsync'
import WebError from './WebError'

export const getAll = (Model: any) =>
  CatchAsync(
    async (
      request: Request,
      response: Response,
      nextFunction: NextFunction
    ) => {
      const documents = await Model.find()

      response.status(200).json({
        status: 'success',
        length: documents.length,
        data: {
          documents,
        },
      })
    }
  )

export const getOne = (Model: any) =>
  CatchAsync(async function (
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const document = await Model.findById(request.query.id)

    if (!document)
      return next(new WebError(404, 'no document exists with that id'))

    return response.status(200).json({
      status: 'success',
      data: {
        document,
      },
    })
  })

export const createOne = (Model: any) =>
  CatchAsync(
    async (request: Request, response: Response, next: NextFunction) => {
      const document = await Model.create(request.body)

      response.status(200).json({
        status: 'success',
        data: {
          document,
        },
      })
    }
  )

export const updateOne = (Model: any) =>
  CatchAsync(
    async (request: Request, response: Response, next: NextFunction) => {
      const document = await Model.findByIdAndUpdate(
        request.params.id,
        request.body,
        {
          runValidators: true,
          new: true,
        }
      )

      if (!document)
        return next(new WebError(404, 'no document exists with that id'))

      response.status(200).json({
        status: 'success',
        data: {
          document,
        },
      })
    }
  )

export const deleteOne = (Model: any) =>
  CatchAsync(
    async (request: Request, response: Response, next: NextFunction) => {
      const document = await Model.findByIdAndDelete(request.params.id)

      if (!document)
        return next(new WebError(404, 'no document exists with that id'))

      response.status(204).json({
        status: 'success',
        data: null,
      })
    }
  )
