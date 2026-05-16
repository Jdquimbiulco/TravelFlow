const destinationService = require('../services/destination.service');

const getAllDestinations = async (req, res, next) => {
  try {
    const destinations = await destinationService.getAllDestinations();
    res.status(200).json(destinations);
  } catch (error) {
    next(error);
  }
};

const getDestinationById = async (req, res, next) => {
  try {
    const destination = await destinationService.getDestinationById(Number(req.params.id));
    if (!destination) return res.status(404).json({ message: 'Destino no encontrado' });
    res.status(200).json(destination);
  } catch (error) {
    next(error);
  }
};

const createDestination = async (req, res, next) => {
  try {
    const destination = await destinationService.createDestination(req.body);
    res.status(201).json(destination);
  } catch (error) {
    next(error);
  }
};

const updateDestination = async (req, res, next) => {
  try {
    const destination = await destinationService.updateDestination(Number(req.params.id), req.body);
    res.status(200).json(destination);
  } catch (error) {
    next(error);
  }
};

const deleteDestination = async (req, res, next) => {
  try {
    await destinationService.deleteDestination(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination
};
