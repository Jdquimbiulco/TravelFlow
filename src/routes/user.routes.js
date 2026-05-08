const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { validateUser } = require('../middlewares/validate.middleware');

const router = Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', validateUser, userController.createUser);
router.put('/:id', validateUser, userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
