const { Error } = require('mongoose');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

const BadRequestError = require('../utils/errors/badRequestError');
const UnauthorizedError = require('../utils/errors/unauthorizedError');
const ConflictError = require('../utils/errors/conflictError');

const { CREATED_STATUS } = require('../utils/constants');

const { NODE_ENV, JWT_SECRET } = process.env;

// POST /signup
const signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ConflictError('Пользователь с таким e-mail уже существует'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashedPassword, name });

    return res.status(CREATED_STATUS).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (err) {
    if (err instanceof Error.ValidationError) {
      return next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
    }
    return next(err);
  }
};

// POST /signin
const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password').orFail();
    const match = await bcrypt.compare(password, user.password);
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
    throw new UnauthorizedError('Передан неверный e-mail или пароль');
  } catch (err) {
    if (err instanceof Error.DocumentNotFoundError) {
      return next(new UnauthorizedError('Передан неверный e-mail или пароль'));
    }
    return next(err);
  }
};

// POST /signout
const signout = (req, res) => {
  res.clearCookie('jwtToken');
  return res.json({ message: 'Вы успешно вышли' });
};

module.exports = { signup, signin, signout };
