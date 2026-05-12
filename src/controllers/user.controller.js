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
const createUser = async (req, res, next) => {
  try { res.status(201).json(await userService.createUser(req.body)); } catch (error) { next(error); }
};
const updateUser = async (req, res, next) => {
  try { res.status(200).json(await userService.updateUser(Number(req.params.id), req.body)); } catch (error) { next(error); }
};
const deleteUser = async (req, res, next) => {
  try { await userService.deleteUser(Number(req.params.id)); res.status(204).send(); } catch (error) { next(error); }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };