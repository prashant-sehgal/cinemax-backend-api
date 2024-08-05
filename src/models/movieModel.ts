import mongoose from 'mongoose'

interface TypeMovie extends mongoose.Document {
  title: string
  releaseYear: number
  duration: number
  ageRating: number
  overview: string
  starring: string[]
  createdBy: string[]
  genres: string[]
  poster: string
}

const movieSchema = new mongoose.Schema<TypeMovie>({
  title: {
    type: String,
    required: [true, 'movie must have a title'],
  },
  releaseYear: {
    type: Number,
    required: [true, 'movie must have a release year'],
  },
  duration: {
    type: Number,
    required: [true, 'movie must have a duration'],
  },
  ageRating: {
    type: Number,
    required: [true, 'movie must have age rating'],
  },
  overview: {
    type: String,
    required: [true, 'movie must have an overview'],
  },
  starring: {
    type: [String],
    required: [true, 'movie must have a starring'],
  },
  createdBy: {
    type: [String],
    required: [true, 'movie must have a created by'],
  },
  genres: {
    type: [String],
    required: [true, 'movie must have genres'],
  },
  poster: {
    type: String,
    required: [true, 'movie must have a poster'],
  },
})

const Movie = mongoose.model('Movie', movieSchema)
export default Movie
