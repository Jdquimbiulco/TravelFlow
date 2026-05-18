const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { validateUser, validateUserUpdate } = require('../middlewares/validate.middleware');
const router = Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/login', userController.loginUser);
router.post('/', validateUser, userController.createUser);
router.put('/:id', validateUserUpdate, userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;