import { NextFunction, Request, Response } from 'express'
import CatchAsync from '../utils/CatchAsync'
import User from '../models/userModel'

export const home = CatchAsync(async function (
  request: Request,
  response: Response,
  next: NextFunction
) {
  const token = request.cookies.token
  if (!token) return response.status(200).redirect('admin/signin')

  return response.status(200).render('admin/index')
})

export function signin(
  request: Request,
  response: Response,
  nextFunction: NextFunction
) {
  return response.status(200).render('admin/signin')
}
