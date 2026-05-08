const prisma = require('../config/db');

const getAllDestinations = async () => {
  return await prisma.destination.findMany();
};

const getDestinationById = async (id) => {
  return await prisma.destination.findUnique({ where: { id } });
};

const createDestination = async (data) => {
  return await prisma.destination.create({ data });
};

const updateDestination = async (id, data) => {
  return await prisma.destination.update({ where: { id }, data });
};

const deleteDestination = async (id) => {
  return await prisma.destination.delete({ where: { id } });
};

module.exports = {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination
};
