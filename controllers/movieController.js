const mongoose = require('mongoose');

const Movie = require('../models/movie');

const BadRequestError = require('../utils/errors/badRequestError');
const NotFoundError = require('../utils/errors/notFoundError');
const ForbiddenError = require('../utils/errors/forbiddenError');

const { SUCCESS_STATUS, CREATED_STATUS } = require('../utils/constants');

const populateOptions = [{ path: 'owner', select: ['name', '_id'] }];

const formatMovie = (movie) => ({
  _id: movie._id,
  country: movie.country,
  director: movie.director,
  duration: movie.duration,
  year: movie.year,
  description: movie.description,
  image: movie.image,
  trailerLink: movie.trailerLink,
  thumbnail: movie.thumbnail,
  movieId: movie.movieId,
  nameRU: movie.nameRU,
  nameEN: movie.nameEN,
  owner: {
    name: movie.owner.name,
    _id: movie.owner._id,
  },
  createdAt: movie.createdAt,
});

// GET /movies
const getMovies = async (req, res, next) => {
  try {
    const cards = await Movie.find({}).populate(populateOptions);
    res.status(SUCCESS_STATUS).send(cards.map(formatMovie));
  } catch (err) {
    next(err);
  }
};

// POST /movies
const createMovie = async (req, res, next) => {
  try {
    const movieData = req.body;
    movieData.owner = req.user._id;
    const movie = await Movie.create(movieData);
    await movie.populate('owner');
    res.status(CREATED_STATUS).send(movie);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      next(new BadRequestError('Переданы некорректные данные при добавлении фильма.'));
    } else {
      next(err);
    }
  }
};

// DELETE /movies/:id
const deleteMovie = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const movie = await Movie.findById(req.params.movieId).orFail();

    if (movie.owner._id.toString() !== userId) {
      throw new ForbiddenError('Нет прав для удаления фильма');
    }

    await Movie.deleteOne({ _id: req.params.movieId });
    return res.status(SUCCESS_STATUS).send({ message: 'Фильм удален.' });
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return next(new BadRequestError('Невалидный идентификатор фильма.'));
    }

    if (err instanceof mongoose.Error.DocumentNotFoundError) {
      return next(new NotFoundError('Передан несуществующий идентификатор фильма.'));
    }

    return next(err);
  }
};

module.exports = { getMovies, createMovie, deleteMovie };
