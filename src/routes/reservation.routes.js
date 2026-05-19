const { Router } = require('express');
const reservationController = require('../controllers/reservation.controller');
const { validateReservation } = require('../middlewares/validate.middleware');
const router = Router();

router.get('/', reservationController.getAllReservations);
router.get('/:id', reservationController.getReservationById);
router.post('/',validateReservation, reservationController.createReservation);
router.put('/:id',validateReservation, reservationController.updateReservation);
router.delete('/:id', reservationController.deleteReservation);

module.exports = router;