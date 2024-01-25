const express = require('express');
const movies = require('./movies.json');
const crypto = require('node:crypto');
const { validateMovie, validatePartialMovie } = require('./schemas/movies');

const app = express();

const PORT = process.env.PORT ?? 1234

app.disable('x-powered-by');
app.use(express.json());

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:1234',
  'http://movies.com',
]

// Todos los recursos que sean MOVIES se identifican con /movies
app.get('/movies', (req, res) => {
  // res.header('Access-Control-Allow-Origin', 'http://localhost:8080')

  const origin = req.header('origin')
  if(ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  const {genre} = req.query;
  if(genre) {
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(filteredMovies)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params;
  const movie = movies.find(movie => movie.id === id);
  if (movie) return res.json(movie)
  res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if(result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(), //uuid v4
    ...result.data
  }

  movies.push(newMovie)

  res.status(201).json(newMovie) // para actualizar la cache del cliente
})

// Actualizar una pelicula
app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if(!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params;
  const movieIndex = movies.findIndex(movie => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updatedMovie;

  return res.json(updatedMovie)
})


// para cors dificiles como el delete
app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  if(ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  }
  res.send(200)
})


// puerto del servidor
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})