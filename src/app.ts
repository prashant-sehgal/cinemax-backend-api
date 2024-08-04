import express, { NextFunction, Request, Response } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import authRouter from './routes/authRoutes'
import WebError from './utils/WebError'

const app = express()

// implementing cors
app.use(cors({ origin: process.env.ORIGIN, credentials: true }))

// Parse Cookie header and populate request.cookies
app.use(cookieParser())

// adding json data and form data in request body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// printing request on to the console in dev mode
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

// routes
app.use('/api/v1/auth', authRouter)

// global error handler
app.use(function (
  error: WebError | any,
  request: Request,
  response: Response,
  next: NextFunction
) {
  return response.status(error.statusCode || 500).json({
    status: error.status || 'error',
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
  })
})

export default app
