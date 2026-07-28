require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:4200',
  'http://localhost:5173',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin && ['development', 'test'].includes(process.env.NODE_ENV)) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origen no permitido → ${origin}`));
  },
  optionsSuccessStatus: 200
};

app.disable('x-powered-by');
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get('/', (req, res) => {
    res.status(200).json({
        mensaje: 'CI/CD Funcionando correctamente',
        servicio: 'API Express lista para Vercel'
    });
});

// Routes
app.use('/api', routes);

app.use(errorHandler);

module.exports = app;