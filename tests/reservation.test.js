const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

jest.mock('../src/config/db', () => ({
    reserva: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

describe('Reservation Endpoints', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockReservation = {
        id: 1,
        usuarioId: 1,
        destinoId: 2,
        fechaInicio: new Date().toISOString(),
        fechaFin: new Date().toISOString(),
        estado: 'PENDIENTE',
        precioTotal: 500,
        fechaReserva: new Date().toISOString()
    };

    it('should get all reservations', async () => {
        prisma.reserva.findMany.mockResolvedValue([mockReservation]);
        const res = await request(app).get('/api/reservas');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([mockReservation]);
        expect(prisma.reserva.findMany).toHaveBeenCalled();
    });

    it('should handle errors when getting all reservations', async () => {
        prisma.reserva.findMany.mockRejectedValue(new Error('DB Error'));
        const res = await request(app).get('/api/reservas');
        expect(res.statusCode).toEqual(500);
    });

    it('should get reservation by id', async () => {
        prisma.reserva.findUnique.mockResolvedValue(mockReservation);
        const res = await request(app).get('/api/reservas/1');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(mockReservation);
        expect(prisma.reserva.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            include: { usuario: true, destino: true }
        });
    });

    it('should return 404 if reservation not found', async () => {
        prisma.reserva.findUnique.mockResolvedValue(null);
        const res = await request(app).get('/api/reservas/999');
        expect(res.statusCode).toEqual(404);
    });

    it('should handle errors when getting reservation by id', async () => {
        prisma.reserva.findUnique.mockRejectedValue(new Error('DB Error'));
        const res = await request(app).get('/api/reservas/1');
        expect(res.statusCode).toEqual(500);
    });

    it('should create a new reservation with valid data', async () => {
        prisma.reserva.create.mockResolvedValue(mockReservation);
        const res = await request(app)
            .post('/api/reservas')
            .send({
                usuarioId: 1,
                destinoId: 2,
                fechaInicio: mockReservation.fechaInicio,
                fechaFin: mockReservation.fechaFin,
                precioTotal: 500
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual(mockReservation);
        expect(prisma.reserva.create).toHaveBeenCalled();
    });

    it('should handle errors when creating a reservation', async () => {
        prisma.reserva.create.mockRejectedValue(new Error('DB Error'));
        const res = await request(app)
            .post('/api/reservas')
            .send({
                usuarioId: 1,
                destinoId: 2,
                fechaInicio: mockReservation.fechaInicio,
                fechaFin: mockReservation.fechaFin,
                precioTotal: 500
            });
        expect(res.statusCode).toEqual(500);
    });

    it('should update a reservation', async () => {
        prisma.reserva.update.mockResolvedValue(mockReservation);
        const res = await request(app)
            .put('/api/reservas/1')
            .send({
                estado: 'CONFIRMADA',
                fechaInicio: mockReservation.fechaInicio,
                fechaFin: mockReservation.fechaFin
            });
        expect(res.statusCode).toEqual(200);
        expect(prisma.reserva.update).toHaveBeenCalled();
    });

    it('should handle errors when updating a reservation', async () => {
        prisma.reserva.update.mockRejectedValue(new Error('DB Error'));
        const res = await request(app)
            .put('/api/reservas/1')
            .send({
                estado: 'CONFIRMADA'
            });
        expect(res.statusCode).toEqual(500);
    });

    it('should delete a reservation', async () => {
        prisma.reserva.delete.mockResolvedValue(mockReservation);
        const res = await request(app).delete('/api/reservas/1');
        expect(res.statusCode).toEqual(204);
        expect(prisma.reserva.delete).toHaveBeenCalledWith({
            where: { id: 1 }
        });
    });

    it('should handle errors when deleting a reservation', async () => {
        prisma.reserva.delete.mockRejectedValue(new Error('DB Error'));
        const res = await request(app).delete('/api/reservas/1');
        expect(res.statusCode).toEqual(500);
    });
});
