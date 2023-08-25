require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const errors = require('./middlewares/errorHandler');
const cors = require('./middlewares/cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://127.0.0.1:27017/bitfilmsdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

app.use(cors);

app.use(requestLogger);

app.use(express.json());

app.use(helmet());

app.use(cookieParser());

app.use(require('./routes/index'));

app.use(errorLogger);

app.use(errors);

app.listen(PORT, () => {
});
