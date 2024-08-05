import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

import CatchAsync from '../utils/CatchAsync'
import User, { TypeUser } from '../models/userModel'
import WebError from '../utils/WebError'
import Mail from '../utils/Mail'

interface Token extends JwtPayload {
  uid: string
}

function verifyToken(token: string, secretOrPublicKey: string): Promise<Token> {
  return new Promise(function (resolve, reject) {
    try {
      const decode = jwt.verify(token, secretOrPublicKey)
      resolve(decode! as Token)
    } catch (error) {
      reject(error)
    }
  })
}

function sendAuthTokenResponse(response: Response, user: TypeUser) {
  const token = jwt.sign({ uid: user._id }, `${process.env.JWT_SECRET_KEY}`, {
    expiresIn: process.env.JWT_EXPIREN_IN,
  })

  const { exp } = jwt.decode(token)! as JwtPayload
  const { fullName, email, _id } = user
  const isProduction = process.env.NODE_ENV === 'production'

  return response
    .cookie('token', token, {
      expires: new Date((exp ? exp : 1) * 1000),
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
    })
    .json({
      status: 'success',
      data: {
        user: { _id, fullName, email },
      },
    })
}

export const signup = CatchAsync(async function (
  request: Request,
  response: Response,
  next: NextFunction
) {
  const { fullName, email, password, confirmPassword } = request.body
  const user = await User.create({
    fullName,
    email,
    password,
    confirmPassword,
  })

  return sendAuthTokenResponse(response, user)
})

export const signin = CatchAsync(async function (
  request: Request,
  response: Response,
  next: NextFunction
) {
  const { email, password } = request.body
  if (!email || !password)
    return next(new WebError(400, 'please provide email and password'))

  const user = await User.findOne({ email })

  if (!user) return next(new WebError(404, 'no user with this email exists'))

  if (!(await user.isPasswordCorrect(password)))
    return next(new WebError(400, 'provided email or password is incorrect'))

  return sendAuthTokenResponse(response, user)
})

export const authenticate = function (type = 'api') {
  return CatchAsync(async function (
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    let token: string = request.cookies.token
    if (!token)
      return next(
        new WebError(
          401,
          'you are not authenticated, please signin to get access'
        )
      )

    // verify token
    const decode = await verifyToken(token, `${process.env.JWT_SECRET_KEY}`)

    // check if user still exists
    const freshUser = await User.findById(decode.uid)
    if (!freshUser)
      return next(
        new WebError(401, 'user belongs to this token not exists anymore')
      )

    // check if user doesn't change password after token is created

    if (freshUser.changedPasswordAfter(decode.iat))
      return next(
        new WebError(401, 'user belongs to this token not exists anymore')
      )

    request.user = freshUser

    return next()
  })
}

export const restrictTo = function (...roles: string[]) {
  return function (request: Request, response: Response, next: NextFunction) {
    if (request.user && !roles.includes(request.user.role))
      return next(
        new WebError(403, 'you are not authorized to access these routes')
      )

    return next()
  }
}

export const forgotPassword = CatchAsync(async function (
  request: Request,
  response: Response,
  next: NextFunction
) {
  const { email } = request.body
  if (!email)
    return next(new WebError(400, 'please provide your registered email'))

  const user = await User.findOne({ email })
  if (!user) return next(new WebError(404, 'not user found with this email'))

  // starting reset password session
  const resetPasswordSession = await user.initiateResetPasswordSession()

  // send mail
  const mail = new Mail(user.email, 'Reset your password')
  mail.sendResetPassword(resetPasswordSession)

  return response.status(200).json({
    status: 'success',
    message: 'Reset password link has been sent to your email',
  })
})

export const resetPassword = CatchAsync(async function (
  request: Request,
  response: Response,
  next: NextFunction
) {
  const { resetPasswordSession, newPassword, confirmNewPassword } = request.body
  if (!resetPasswordSession || !newPassword || !confirmNewPassword)
    return next(
      new WebError(
        400,
        'please provide resetPasswordSession, newPassword and confirmNewPassword'
      )
    )

  const user = await User.findOne({ resetPasswordSession })

  if (!user) return next(new WebError(404, 'session not found'))

  const webError = await user.validateAndResetPassword(
    newPassword,
    confirmNewPassword
  )
  if (webError) return next(webError)

  return response.status(200).json({
    status: 'success',
    message: 'password is successfuly changed',
  })
})
