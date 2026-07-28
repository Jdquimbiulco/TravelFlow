const userService = require('../services/user.service');

const getAllUsers = async (req, res, next) => {
  try { res.status(200).json(await userService.getAllUsers()); } catch (error) { next(error); }
};
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(Number(req.params.id));
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json(user);
  } catch (error) { next(error); }
};
const loginUser = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;
    if (!correo || !contrasena) {
      return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
    }
    const user = await userService.loginUser(correo, contrasena);
    if (!user) return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    res.status(200).json(user);
  } catch (error) { next(error); }
};
const createUser = async (req, res, next) => {
  try { res.status(201).json(await userService.createUser(req.body)); } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'El correo o documento de identidad ya está registrado' });
    }
    next(error);
  }
};
const updateUser = async (req, res, next) => {
  try { res.status(200).json(await userService.updateUser(Number(req.params.id), req.body)); } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'El correo o documento ya pertenece a otro usuario' });
    }
    next(error);
  }
};
const deleteUser = async (req, res, next) => {
  try { await userService.deleteUser(Number(req.params.id)); res.status(204).send(); } catch (error) { next(error); }
};

module.exports = { getAllUsers, getUserById, loginUser, createUser, updateUser, deleteUser };