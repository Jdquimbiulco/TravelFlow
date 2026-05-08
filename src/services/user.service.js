const prisma = require('../config/db');

const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true, updatedAt: true }
  });
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, createdAt: true, updatedAt: true }
  });
};

const createUser = async (data) => {
  return await prisma.user.create({
    data,
    select: { id: true, email: true, name: true, createdAt: true, updatedAt: true }
  });
};

const updateUser = async (id, data) => {
  return await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, createdAt: true, updatedAt: true }
  });
};

const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id }
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
