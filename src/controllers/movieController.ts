import { BlobServiceClient } from '@azure/storage-blob'
import { readFile, unlink } from 'node:fs/promises'
import Movie from '../models/movieModel'
import multer from 'multer'
import { createOne } from '../utils/RESTHandlers'
import { NextFunction, Request, Response } from 'express'
import CatchAsync from '../utils/CatchAsync'

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

// uploading poster on azure from temp folder
export const upload = CatchAsync(async function (
  request: Request,
  reponse: Response,
  next: NextFunction
) {
  if (!request.body.poster) return next()

  const blobServiceClient = new BlobServiceClient(
    `${process.env.CLOUD_PUBLIC_WRITE_SAS}`
  )

  // Get a reference to a container
  const containerClient = blobServiceClient.getContainerClient('posters')

  // Get a block blob client
  const blockBlobClient = containerClient.getBlockBlobClient(
    request.body.poster
  )

  // Read the file content
  const fileContent = await readFile(
    `${__dirname}/../../temp/${request.body.poster}`
  )

  // Upload the file
  await blockBlobClient.upload(fileContent, fileContent.length)

  //   removing temp file from filesystem
  await unlink(`${__dirname}/../../temp/${request.body.poster}`)

  next()
})

// create one movie handler
export const createMovie = createOne(Movie)
