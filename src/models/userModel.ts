import mongoose, { Document } from 'mongoose'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import WebError from '../utils/WebError'

export interface TypeUser extends Document {
  fullName: string
  email: string
  password: string
  confirmPassword: string | undefined
  role: string
  passwordChangedAt: Date
  createdAt: Date
  resetPasswordSession: string
  resetPasswordSessionExpiresIn: Date

  // Methods
  isPasswordCorrect: Function
  changedPasswordAfter: Function
  initiateResetPasswordSession: Function
  validateAndResetPassword: (
    newPassword: string,
    confirmNewPassword: string
  ) => Promise<WebError | undefined>
}

const userSchema = new mongoose.Schema<TypeUser>({
  fullName: {
    type: String,
    required: [true, 'user must have a full name'],
  },
  email: {
    type: String,
    required: [true, 'user must have an email id'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'user must have a password'],
  },
  confirmPassword: {
    type: String,
    required: [true, 'user must confirm their password'],
    validate: {
      validator: function (confirmPassword) {
        return confirmPassword === this.password
      },
      message: 'confirmation password must match the original password.',
    },
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now(),
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },

  resetPasswordSession: String,
  resetPasswordSessionExpiresIn: Date,
})

async function hashPassword(password: string) {
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  return hashedPassword
}

function hash(message: string) {
  return crypto.createHash('sha-256').update(message).digest('hex')
}

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return

  this.password = await hashPassword(this.password)
  this.confirmPassword = undefined
  next()
})

userSchema.methods.isPasswordCorrect = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.changedPasswordAfter = function (timestamp: number) {
  const passwordChangedAtTimestamp = Math.floor(
    this.passwordChangedAt.getTime() / 1000
  )
  return timestamp < passwordChangedAtTimestamp
}

userSchema.methods.initiateResetPasswordSession =
  async function (): Promise<string> {
    this.resetPasswordSession = hash(`${Math.random() * 1_000_000_000}`)

    const sessionTimeMS = 5 * 60 * 1000 // 5 minutes in miliseconds
    this.resetPasswordSessionExpiresIn = new Date(Date.now() + sessionTimeMS)

    await this.save({ validateBeforeSave: false })

    return this.resetPasswordSession
  }

userSchema.methods.validateAndResetPassword = async function (
  newPassword: string,
  confirmNewPassword: string
): Promise<WebError | undefined> {
  const sessionExpiresInTimestamp = this.resetPasswordSessionExpiresIn.getTime()

  if (sessionExpiresInTimestamp < Date.now())
    return new WebError(400, 'session has already expired')

  this.password = newPassword
  this.confirmPassword = confirmNewPassword
  this.resetPasswordSession = undefined
  this.resetPasswordSessionExpiresIn = undefined

  await this.save({ validateBeforeSave: true })
}

const User = mongoose.model('User', userSchema)
export default User
