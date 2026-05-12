const prisma = require('../config/db');

const getAllReservations = async () => {
  return await prisma.reserva.findMany({
    include: { usuario: true, destino: true }
  });
};

const getReservationById = async (id) => {
  return await prisma.reserva.findUnique({
    where: { id },
    include: { usuario: true, destino: true }
  });
};

const createReservation = async (data) => {
  const formattedData = {
    ...data,
    fechaInicio: new Date(data.fechaInicio),
    fechaFin: new Date(data.fechaFin)
  };
  return await prisma.reserva.create({ data: formattedData });
};

const updateReservation = async (id, data) => {
  const formattedData = { ...data };
  if (data.fechaInicio) formattedData.fechaInicio = new Date(data.fechaInicio);
  if (data.fechaFin) formattedData.fechaFin = new Date(data.fechaFin);

  return await prisma.reserva.update({ where: { id }, data: formattedData });
};

const deleteReservation = async (id) => {
  return await prisma.reserva.delete({ where: { id } });
};

module.exports = {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation
};
