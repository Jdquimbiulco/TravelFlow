const paymentService = require('../services/payment.service');

const getAllPayments = async (req, res, next) => {
  try { res.status(200).json(await paymentService.getAllPayments()); } catch (error) { next(error); }
};
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(Number(req.params.id));
    if (!payment) return res.status(404).json({ message: 'Pago no encontrado' });
    res.status(200).json(payment);
  } catch (error) { next(error); }
};
const createPayment = async (req, res, next) => {
  try { res.status(201).json(await paymentService.createPayment(req.body)); } catch (error) { next(error); }
};
const updatePayment = async (req, res, next) => {
  try { res.status(200).json(await paymentService.updatePayment(Number(req.params.id), req.body)); } catch (error) { next(error); }
};
const deletePayment = async (req, res, next) => {
  try { await paymentService.deletePayment(Number(req.params.id)); res.status(204).send(); } catch (error) { next(error); }
};

module.exports = { getAllPayments, getPaymentById, createPayment, updatePayment, deletePayment };