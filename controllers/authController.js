const { Error } = require('mongoose');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

const { responseMessage } = require('../utils/config');

const { CREATED_STATUS, SUCCESS_STATUS } = require('../utils/constants');

const BadRequestError = require('../utils/errors/badRequestError');
const UnauthorizedError = require('../utils/errors/unauthorizedError');
const ConflictError = require('../utils/errors/conflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

// POST /signup

const signup = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => {
      responseMessage(res, CREATED_STATUS, {
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    })
    .catch((err) => {
      if (err instanceof Error.ValidationError) {
        return next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
      }

      if (err.code === 11000) {
        return next(new ConflictError('Пользователь с таким e-mail зарегистрирован'));
      }

      return next(err);
    })
    .catch(next);
};

// POST /signin
const signin = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .select('+password')
    .orFail()
    .then((user) => bcrypt.compare(password, user.password).then((match) => {
      if (match) {
        const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'rumiya-secret-key', {
          expiresIn: '7d',
        });
        res.cookie('jwtToken', token, {
          maxAge: 3600,
          httpOnly: true,
        });
        return res.send({ jwtToken: token });
      }
      throw new UnauthorizedError('Переданы неверный email или пароль');
    }))
    .catch((err) => {
      if (err instanceof Error.DocumentNotFoundError) {
        return next(new UnauthorizedError('Переданы неверный email или пароль'));
      }
      return next(err);
    });
};

// POST /signout
const signout = (req, res) => {
  try {
    res.clearCookie('jwtToken');
    return responseMessage(res, SUCCESS_STATUS, { message: 'Вы успешно вышли' });
  } catch (err) {
    return new Error('Произошла ошибка при попытке выйти из акканута');
  }
};

module.exports = { signup, signin, signout };
