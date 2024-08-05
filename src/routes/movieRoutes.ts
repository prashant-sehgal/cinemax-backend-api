import { Router } from 'express'
import * as movieController from '../controllers/movieController'
import * as authController from '../controllers/authController'
import multer from 'multer'

const router = Router()
const upload = multer({ storage: movieController.storage })

router.use(authController.authenticate())
router.use(authController.restrictTo('admin'))

router.route('/').get(movieController.getAllMovies).post(
  upload.single('poster'),
  movieController.upload, // uploading poster to cloud
  movieController.createMovie
)

router.route('/:id').get(movieController.getMovie)

export default router
