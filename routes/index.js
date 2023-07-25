const express = require('express');
const { errors } = require('celebrate');

const usersRouter = require('./users');
const moviesRouter = require('./movies');

const auth = require('../middlewares/auth');

const { signin, signup, signout } = require('../controllers/authController');
const {
  signinValidator,
  signupValidator,
} = require('../middlewares/validation');

const NotFoundError = require('../utils/errors/notFoundError');

const router = express.Router();

router.post('/signin', signinValidator, signin);
router.post('/signup', signupValidator, signup);

router.use(auth);

router.use('/users', usersRouter);
router.use('/movies', moviesRouter);

router.post('/signout', signout);

router.use((req, res, next) => next(new NotFoundError('Маршрут не найден')));

router.use(errors());

module.exports = router;
