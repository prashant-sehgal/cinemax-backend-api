import express, { NextFunction, Request, Response } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import authRouter from './routes/authRoutes'
import movieRouter from './routes/movieRoutes'
import viewRouter from './routes/viewRoutes'
import WebError from './utils/WebError'

const app = express()

// implementing cors
app.use(cors({ origin: process.env.ORIGIN, credentials: true }))

// Parse Cookie header and populate request.cookies
app.use(cookieParser())

// adding json data and form data in request body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// serving static files
app.use(express.static(`${__dirname}/../public`))

// setting up view template as pug
app.set('view engine', 'pug')

// printing request on to the console in dev mode
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

// routes
app.use('/admin', viewRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/movies', movieRouter)

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
