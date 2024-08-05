import { Router } from 'express'
import * as movieController from '../controllers/movieController'
import * as authController from '../controllers/authController'
import multer from 'multer'

const router = Router()
const upload = multer({ storage: movieController.storage })

router.use(authController.authenticate)
router.use(authController.restrictTo('admin'))

router.post('/', upload.single('poster'), (req, res) => {
  res.json({
    body: req.body,
  })
})

export default router
