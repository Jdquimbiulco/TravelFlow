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
    // Permitir requests sin origin (ej: curl, postman) o en desarrollo/test
    if (!origin || ['development', 'test'].includes(process.env.NODE_ENV)) {
      return callback(null, true);
    }
    // Permitir cualquier subdominio de vercel para facilitar el despliegue del frontend
    if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
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
// Montamos en ambos para evitar problemas de enrutamiento en Vercel si Vercel remueve el /api o no
app.use('/api', routes);
app.use('/', routes);

app.use(errorHandler);

module.exports = app;