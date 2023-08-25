const Movie = require('../models/movie');

const NotFoundError = require('../utils/errors/notFoundError');
const ForbiddenError = require('../utils/errors/forbiddenError');

const { responseMessage } = require('../utils/config');
const { SUCCESS_STATUS, CREATED_STATUS } = require('../utils/constants');

// GET /movies

const getMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner })
    .then((movies) => responseMessage(res, SUCCESS_STATUS, { data: movies }))
    .catch(next);
};

// POST /movies
const createMovie = (req, res, next) => {
  const owner = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => responseMessage(res, CREATED_STATUS, { data: movie }))
    .catch(next);
};

// DELETE /movies/:id

const deleteMovie = (req, res, next) => {
  const owner = req.user._id;
  const { _id } = req.params;

  Movie.findById(_id)
    .orFail(() => {
      throw new NotFoundError('Фильм не найден.');
    })
    .then((movie) => {
      if (owner !== String(movie.owner)) {
        throw new ForbiddenError('Нет прав для удаления фильма.');
      } else {
        return movie.deleteOne()
          .then(() => responseMessage(res, SUCCESS_STATUS, { message: 'Фильм удален.' }));
      }
    })
    .catch(next);
};

module.exports = { getMovies, createMovie, deleteMovie };
