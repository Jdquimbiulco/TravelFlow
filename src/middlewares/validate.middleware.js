const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateUser = [
  body('correo').isEmail().withMessage('Se requiere un correo válido'),
  body('contrasena').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  validateRequest,
];

const validateDestination = [
  body('nombre').notEmpty().withMessage('El nombre del destino es obligatorio'),
  body('pais').notEmpty().withMessage('El país es obligatorio'),
  body('ciudad').notEmpty().withMessage('La ciudad es obligatoria'),
  body('cuposDisponibles').isInt({ min: 0 }).withMessage('Los cupos deben ser un número entero válido'),
  body('precioPorDia').isFloat({ min: 0 }).withMessage('El precio debe ser un valor positivo'),
  validateRequest,
];

module.exports = {
  validateUser,
  validateDestination,
  validateRequest
};
