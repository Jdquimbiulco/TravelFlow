const prisma = require('../config/db');

const getAllReservations = async () => {
  return await prisma.reservation.findMany({ include: { user: true, destination: true } });
};

const getReservationById = async (id) => {
  return await prisma.reservation.findUnique({
    where: { id },
    include: { user: true, destination: true }
  });
};

const createReservation = async (data) => {
  return await prisma.reservation.create({ data });
};

const updateReservation = async (id, data) => {
  return await prisma.reservation.update({ where: { id }, data });
};

const deleteReservation = async (id) => {
  return await prisma.reservation.delete({ where: { id } });
};

module.exports = {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation
};
