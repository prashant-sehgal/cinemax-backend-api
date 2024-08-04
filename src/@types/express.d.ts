import { TypeUser } from '../models/userModel'

declare module 'express-serve-static-core' {
  interface Request {
    user?: TypeUser
  }
}
