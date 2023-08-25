const User = require('../models/user');
const { responseMessage } = require('../utils/config');

const {
  SUCCESS_STATUS,
} = require('../utils/constants');

// GET /users/me
const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => responseMessage(res, SUCCESS_STATUS, { data: user }))
    .catch(next);
};

// PATCH /users/me
const updateUser = (req, res, next) => {
  const owner = req.user._id;
  const { email, name } = req.body;

  User.findByIdAndUpdate(owner, { email, name }, { new: true, runValidators: true })
    .then((userInfo) => responseMessage(res, SUCCESS_STATUS, { data: userInfo }))
    .catch(next);
};

module.exports = { getCurrentUser, updateUser };
