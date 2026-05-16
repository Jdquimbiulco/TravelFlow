const prisma = require('../config/db');

const getAllUsers = async () => {
  return await prisma.usuario.findMany({
    select: { id: true, correo: true, nombre: true, rol: true, fechaRegistro: true }
  });
};

const getUserById = async (id) => {
  return await prisma.usuario.findUnique({
    where: { id },
    select: { id: true, correo: true, nombre: true, rol: true, fechaRegistro: true }
  });
};

const createUser = async (data) => {
  return await prisma.usuario.create({
    data,
    select: { id: true, correo: true, nombre: true, rol: true }
  });
};

const updateUser = async (id, data) => {
  return await prisma.usuario.update({
    where: { id },
    data,
    select: { id: true, correo: true, nombre: true, rol: true }
  });
};

const deleteUser = async (id) => {
  return await prisma.usuario.delete({ where: { id } });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
