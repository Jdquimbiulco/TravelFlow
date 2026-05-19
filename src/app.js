require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); 
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.disable('x-powered-by');
app.use(helmet());

// Orígenes permitidos desde variable de entorno o fallback a localhost
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:4200',
  'http://localhost:5173',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origen no permitido → ${origin}`));
    }
  },
  optionsSuccessStatus: 200
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
