const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ── Reglas reutilizables ──────────────────────────────────────
const correoRule = (optional = false) => {
  const rule = body('correo').trim().isEmail().withMessage('Se requiere un correo válido');
  return optional ? rule.optional() : rule;
};

const contrasenaRule = (optional = false) => {
  const rule = body('contrasena')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres');
  return optional ? rule.optional() : rule;
};

const nombreRule = (optional = false) => {
  // ✅ .optional() debe ir PRIMERO, antes de cualquier validación
  const base = body('nombre').trim();
  const rule = optional ? base.optional() : base;
  return rule
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/)
    .withMessage('El nombre solo puede contener letras y espacios');
};

const telefonoRule = () =>
  body('telefono')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 9, max: 9 })
    .withMessage('El teléfono debe tener 9 dígitos numéricos')
    .isNumeric()
    .withMessage('El teléfono solo debe contener números');

const documentoRule = () =>
  body('documentoIdentidad')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 10 })
    .withMessage('El documento de identidad debe tener al menos 10 dígitos')
    .isNumeric()
    .withMessage('El documento de identidad solo debe contener números');

// ── Validadores ───────────────────────────────────────────────
const validateUser = [
  correoRule(),
  contrasenaRule(),
  nombreRule(),
  telefonoRule(),
  documentoRule(),
  validateRequest,
];

const validateUserUpdate = [
  correoRule(true),
  contrasenaRule(true),
  nombreRule(true),
  telefonoRule(),
  documentoRule(),
  validateRequest,
];

const validateDestination = [
  body('nombre').notEmpty().withMessage('El nombre del destino es obligatorio'),
  body('pais').notEmpty().withMessage('El país es obligatorio'),
  body('ciudad').notEmpty().withMessage('La ciudad es obligatoria'),
  body('cuposDisponibles')
    .isInt({ min: 0 })
    .withMessage('Los cupos deben ser un número entero válido'),
  body('precioPorDia')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un valor positivo'),
  validateRequest,
];

module.exports = {
  validateUser,
  validateUserUpdate,
  validateDestination,
  validateRequest,
};