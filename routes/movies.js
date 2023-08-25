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
router.delete('/:_id', inputIdMovieValidator, deleteMovie);

module.exports = router;
