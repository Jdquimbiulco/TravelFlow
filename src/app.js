const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Middlewares
app.use(cors());
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

// Error handling middleware
app.use(errorHandler);

module.exports = app;
