const reservationService = require('../services/reservation.service');

const getAllReservations = async (req, res, next) => {
  try { res.status(200).json(await reservationService.getAllReservations()); } catch (error) { next(error); }
};
const getReservationById = async (req, res, next) => {
  try {
    const reservation = await reservationService.getReservationById(Number(req.params.id));
    if (!reservation) return res.status(404).json({ message: 'Reserva no encontrada' });
    res.status(200).json(reservation);
  } catch (error) { next(error); }
};
const createReservation = async (req, res, next) => {
  try { res.status(201).json(await reservationService.createReservation(req.body)); } catch (error) { next(error); }
};
const updateReservation = async (req, res, next) => {
  try { res.status(200).json(await reservationService.updateReservation(Number(req.params.id), req.body)); } catch (error) { next(error); }
};
const deleteReservation = async (req, res, next) => {
  try { await reservationService.deleteReservation(Number(req.params.id)); res.status(204).send(); } catch (error) { next(error); }
};

module.exports = { getAllReservations, getReservationById, createReservation, updateReservation, deleteReservation };