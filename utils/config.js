const rateLimit = require('express-rate-limit');

const responseMessage = (res, status, obj) => res.status(status).send(obj);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

module.exports = {
  limiter,
  responseMessage,
};
