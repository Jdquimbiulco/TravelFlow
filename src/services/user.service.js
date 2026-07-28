const prisma = require('../config/db');

const getAllUsers = async () => {
  return await prisma.usuario.findMany({
    select: { id: true, correo: true, nombre: true, rol: true, fechaRegistro: true }
  });
};

const getUserById = async (id) => {
  return await prisma.usuario.findUnique({
    where: { id },
    select: { id: true, correo: true, nombre: true, telefono: true, rol: true, fechaRegistro: true }
  });
};

const getUserByEmail = async (correo) => {
  return await prisma.usuario.findUnique({
    where: { correo }
  });
};

const loginUser = async (correo, contrasena) => {
  const user = await getUserByEmail(correo);
  if (!user || user.contrasena !== contrasena) return null;
  return {
    id: user.id,
    correo: user.correo,
    nombre: user.nombre,
    telefono: user.telefono,
    rol: user.rol
  };
};

const createUser = async (data) => {
  const sanitizedData = { ...data };
  if (sanitizedData.documentoIdentidad === "") sanitizedData.documentoIdentidad = null;
  if (sanitizedData.telefono === "") sanitizedData.telefono = null;

  return await prisma.usuario.create({
    data: sanitizedData,
    select: { id: true, correo: true, nombre: true, rol: true }
  });
};

const updateUser = async (id, data) => {
  return await prisma.usuario.update({
    where: { id },
    data,
    select: { id: true, correo: true, nombre: true, telefono: true, rol: true }
  });
};

const deleteUser = async (id) => {
  return await prisma.usuario.delete({ where: { id } });
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  loginUser,
  createUser,
  updateUser,
  deleteUser
};
