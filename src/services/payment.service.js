const prisma = require('../config/db');

const getAllPayments = async () => {
  return await prisma.pago.findMany();
};

const getPaymentById = async (id) => {
  return await prisma.pago.findUnique({ where: { id } });
};

const createPayment = async (data) => {
  return await prisma.pago.create({ data });
};

const updatePayment = async (id, data) => {
  return await prisma.pago.update({ where: { id }, data });
};

const deletePayment = async (id) => {
  return await prisma.pago.delete({ where: { id } });
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment
};