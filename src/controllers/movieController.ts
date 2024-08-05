import Movie from '../models/movieModel'
import { createOne } from '../utils/RESTHandlers'
import multer from 'multer'

export const storage = multer.diskStorage({
  destination: `${__dirname}/../../temp`,

  filename(req, file, callback) {
    const ext = file.mimetype.split('/')[1] // extracting file type for mimtype(**/*)

    const fileName = `poster-${Date.now()}-${Math.floor(
      Math.random() * 1_000_000_000
    )}.${ext}`

    // adding file in request body
    req.body.poster = fileName

    callback(null, fileName)
  },
})

// create one movie handler
export const createMovie = createOne(Movie)
