import { Router } from 'express'
import * as authController from '../controllers/authController'

const router = Router()

router.post('/signup', authController.signup)
router.post('/signin', authController.signin)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)

export default router
