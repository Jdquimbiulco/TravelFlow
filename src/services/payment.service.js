const prisma = require('../config/db');

const getAllPayments = async () => {
  return await prisma.pago.findMany({
    include: {
      reserva: {
        include: {
          usuario: true,
          destino: true
        }
      }
    }
  });
};

const getPaymentById = async (id) => {
  return await prisma.pago.findUnique({
    where: { id },
    include: {
      reserva: {
        include: {
          usuario: true,
          destino: true
        }
      }
    }
  });
};

const createPayment = async (data) => {
  const pago = await prisma.pago.create({ data });
  if (pago.reservaId) {
    await prisma.reserva.update({
      where: { id: pago.reservaId },
      data: { estado: 'COMPLETADO' }
    });
  }
  return pago;
};

const updatePayment = async (id, data) => {
  return await prisma.pago.update({ where: { id }, data });
};

const deletePayment = async (id) => {
  const pago = await prisma.pago.findUnique({ where: { id } });
  if (pago?.reservaId) {
    await prisma.reserva.update({
      where: { id: pago.reservaId },
      data: { estado: 'PENDIENTE' }
    });
  }
  return await prisma.pago.delete({ where: { id } });
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment
};