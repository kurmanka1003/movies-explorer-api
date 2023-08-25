const { Error } = require('mongoose');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

const { responseMessage } = require('../utils/config');

const { CREATED_STATUS, SUCCESS_STATUS } = require('../utils/constants');

const { NODE_ENV, JWT_SECRET } = process.env;

// POST /signup
const signup = (req, res, next) => {
  const {
    email,
    password,
    name,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => {
      responseMessage(res, CREATED_STATUS, {
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    })
    .catch(next);
};

// POST /signin
const signin = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'rumiya-secret-key', {
        expiresIn: '7d',
      });

      res.cookie('jwt', token, {
        maxAge: 3600,
        httpOnly: true,
      })
        .send({ message: 'Авторизация прошла успешно' });
    })
    .catch(next);
};

// POST /signout
const signout = (req, res) => {
  try {
    res.clearCookie('jwt');
    return responseMessage(res, SUCCESS_STATUS, { message: 'Вы успешно вышли' });
  } catch (err) {
    return new Error('Произошла ошибка при попытке выйти из акканута');
  }
};

module.exports = { signup, signin, signout };
