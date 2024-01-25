const z = require('zod');

// esquema de validaciones
const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Title must be a string',
    required_error: 'Title is required',
  }),
  year: z.number().int().min(1900).max(2025),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5.5),
  poster: z.string().url({
    message: 'Poster must be a valid URL',
  }),
  genre: z.array(
    z.enum(['Action', 'Comedy', 'Crime', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi']),
    {
      required_error: 'Genre is required',
      invalid_type_error: 'Genre must be an array of enum Genre',
    }
  )
})

function validateMovie(input) {
  return movieSchema.safeParse(input)
}

function validatePartialMovie (input) {
  return movieSchema.partial().safeParse(input)
}

module.exports = { 
  validateMovie, 
  validatePartialMovie
}