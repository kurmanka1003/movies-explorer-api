const jwt = require('jsonwebtoken');

const UnauthorizedError = require('../utils/errors/unauthorizedError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  const bearer = 'Bearer ';
  if (!authorization || !authorization.startsWith(bearer)) {
    return next(new UnauthorizedError('Необходимо авторизоваться'));
  }
  const token = authorization.replace(bearer, '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'rumiya-secret-key');
  } catch (err) {
    const error = new UnauthorizedError('Необходимо авторизоваться');
    return next(error);
  }

  req.user = payload;
  return next();
};
