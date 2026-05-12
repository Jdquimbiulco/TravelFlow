const { Router } = require('express');
const destinationController = require('../controllers/destination.controller');
const { validateDestination } = require('../middlewares/validate.middleware');

const router = Router();

router.get('/', destinationController.getAllDestinations);
router.get('/:id', destinationController.getDestinationById);

router.post('/', validateDestination, destinationController.createDestination);
router.put('/:id', validateDestination, destinationController.updateDestination);
router.delete('/:id', destinationController.deleteDestination);

module.exports = router;
