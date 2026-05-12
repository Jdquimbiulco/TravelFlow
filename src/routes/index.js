const { Router } = require('express');
const userRoutes = require('./user.routes');
const destinationRoutes = require('./destination.routes');
const reservationRoutes = require('./reservation.routes');
const paymentRoutes = require('./payment.routes');

const router = Router();

router.use('/destinos', destinationRoutes);
router.use('/pagos', paymentRoutes);
router.use('/reservas', reservationRoutes);
router.use('/usuarios', userRoutes);

module.exports = router;
