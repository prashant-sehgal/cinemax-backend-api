import { NextFunction, Request, Response } from 'express'

export default function CatchAsync(fun: Function) {
  return async function (
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    fun(request, response, next).catch(next)
  }
}
