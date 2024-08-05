import { Router } from 'express'
import * as movieController from '../controllers/movieController'
import * as authController from '../controllers/authController'
import multer from 'multer'

const router = Router()
const upload = multer({ storage: movieController.storage })

router.use(authController.authenticate())
router.use(authController.restrictTo('admin'))

router.post(
  '/',
  upload.single('poster'),
  movieController.upload, // uploading poster to cloud
  movieController.createMovie
)

export default router
