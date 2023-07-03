const { ValidationError } = require('mongoose').Error;

const User = require('../models/user');

const BadRequestError = require('../utils/errors/badRequestError');
const NotFoundError = require('../utils/errors/notFoundError');

const {
  SUCCESS_STATUS,
} = require('../utils/constants');

const formatUserData = (user) => ({
  name: user.name,
  _id: user._id,
  email: user.email,
});

// GET /users/me

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).orFail(() => {
      throw new NotFoundError('Указанный идентификатор пользователя не найден');
    });
    res.status(SUCCESS_STATUS).send(formatUserData(user));
  } catch (err) {
    next(err);
  }
};

// PATCH /users/me
const updateUser = async (req, res, next) => {
  try {
    const updateData = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(SUCCESS_STATUS).send(formatUserData(user));
  } catch (err) {
    if (err instanceof ValidationError) {
      return next(new BadRequestError('Переданы некорректные данные при обновлении пользователя.'));
    }

    return next(err);
  }
};

module.exports = { getCurrentUser, updateUser };
