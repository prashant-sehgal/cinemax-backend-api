import { Router } from 'express'
import * as viewsController from '../controllers/viewsController'
import * as authController from '../controllers/authController'

const router = Router()

router
  .route('/signin')
  .get(viewsController.signin)
  .post(authController.signin('view'))

router.use(authController.authenticate('view'))
router.use(authController.restrictTo('admin'))

router.route('/').get(viewsController.home)

export default router
