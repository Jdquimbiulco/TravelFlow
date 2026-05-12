const prisma = require('../config/db');

const getAllDestinations = async () => {
  return await prisma.destino.findMany();
};

const getDestinationById = async (id) => {
  return await prisma.destino.findUnique({ where: { id } });
};

const createDestination = async (data) => {
  return await prisma.destino.create({ data });
};

const updateDestination = async (id, data) => {
  return await prisma.destino.update({ where: { id }, data });
};

const deleteDestination = async (id) => {
  return await prisma.destino.delete({ where: { id } });
};

module.exports = {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination
};
