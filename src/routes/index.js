const { Router } = require('express');
const userRoutes = require('./user.routes');
const destinationRoutes = require('./destination.routes');
const reservationRoutes = require('./reservation.routes');
const paymentRoutes = require('./payment.routes');

const router = Router();

router.use('/users', userRoutes);
router.use('/destinations', destinationRoutes);
router.use('/reservations', reservationRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;
