const prisma = require('../config/db');

const getAllPayments = async () => {
  return await prisma.payment.findMany();
};

const getPaymentById = async (id) => {
  return await prisma.payment.findUnique({ where: { id } });
};

const createPayment = async (data) => {
  return await prisma.payment.create({ data });
};

const updatePayment = async (id, data) => {
  return await prisma.payment.update({ where: { id }, data });
};

const deletePayment = async (id) => {
  return await prisma.payment.delete({ where: { id } });
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment
};
