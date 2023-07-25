const express = require('express');

const router = express.Router();

const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movieController');

const {
  createMovieValidator,
  inputIdMovieValidator,
} = require('../middlewares/validation');

router.get('/', getMovies);
router.post('/', createMovieValidator, createMovie);
router.delete('/:movieId', inputIdMovieValidator, deleteMovie);

module.exports = router;
