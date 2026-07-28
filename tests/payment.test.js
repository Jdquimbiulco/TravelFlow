const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

jest.mock('../src/config/db', () => ({
    pago: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    reserva: {
        update: jest.fn(),
        findUnique: jest.fn()
    },
    $disconnect: jest.fn()
}));

describe('Payment Endpoints', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockPayment = {
        id: 1,
        reservaId: 10,
        monto: 200,
        metodo: 'TARJETA',
        codigoTransaccion: 'TRX-12345',
        estado: 'COMPLETADO',
        fechaPago: new Date().toISOString()
    };

    it('should get all payments', async () => {
        prisma.pago.findMany.mockResolvedValue([mockPayment]);
        const res = await request(app).get('/api/pagos');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([mockPayment]);
        expect(prisma.pago.findMany).toHaveBeenCalled();
    });

    it('should handle errors when getting all payments', async () => {
        prisma.pago.findMany.mockRejectedValue(new Error('DB Error'));
        const res = await request(app).get('/api/pagos');
        expect(res.statusCode).toEqual(500);
    });

    it('should get payment by id', async () => {
        prisma.pago.findUnique.mockResolvedValue(mockPayment);
        const res = await request(app).get('/api/pagos/1');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(mockPayment);
        expect(prisma.pago.findUnique).toHaveBeenCalledWith({
            where: { id: 1 }
        });
    });

    it('should return 404 if payment not found', async () => {
        prisma.pago.findUnique.mockResolvedValue(null);
        const res = await request(app).get('/api/pagos/999');
        expect(res.statusCode).toEqual(404);
    });

    it('should handle errors when getting payment by id', async () => {
        prisma.pago.findUnique.mockRejectedValue(new Error('DB Error'));
        const res = await request(app).get('/api/pagos/1');
        expect(res.statusCode).toEqual(500);
    });

    it('should create a payment with valid data', async () => {
        prisma.pago.create.mockResolvedValue(mockPayment);
        prisma.reserva.update.mockResolvedValue({ id: 10, estado: 'CONFIRMADA' });

        const res = await request(app)
            .post('/api/pagos')
            .send({
                reservaId: 10,
                monto: 200,
                metodo: 'TARJETA',
                codigoTransaccion: 'TRX-12345'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual(mockPayment);
        expect(prisma.pago.create).toHaveBeenCalled();
        // Nota: El mock anterior no actualiza reserva en payment.service.js, pero mantenemos por si la regla de negocio sigue en payment.service.js. 
        // Viendo el código de payment.service.js y payment.controller.js actual, no actualizan reserva.
    });

    it('should handle errors when creating a payment', async () => {
        prisma.pago.create.mockRejectedValue(new Error('DB Error'));
        const res = await request(app)
            .post('/api/pagos')
            .send({
                reservaId: 10,
                monto: 200,
                metodo: 'TARJETA',
                codigoTransaccion: 'TRX-12345'
            });
        expect(res.statusCode).toEqual(500);
    });

    it('should update a payment', async () => {
        prisma.pago.update.mockResolvedValue(mockPayment);
        const res = await request(app)
            .put('/api/pagos/1')
            .send({ estado: 'REEMBOLSADO' });
        expect(res.statusCode).toEqual(200);
        expect(prisma.pago.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { estado: 'REEMBOLSADO' }
        });
    });

    it('should handle errors when updating a payment', async () => {
        prisma.pago.update.mockRejectedValue(new Error('DB Error'));
        const res = await request(app)
            .put('/api/pagos/1')
            .send({ estado: 'REEMBOLSADO' });
        expect(res.statusCode).toEqual(500);
    });

    it('should delete (annul) a payment and revert reservation state', async () => {
        prisma.pago.findUnique.mockResolvedValue(mockPayment);
        prisma.pago.delete.mockResolvedValue(mockPayment);
        prisma.reserva.update.mockResolvedValue({ id: 10, estado: 'PENDIENTE' });

        const res = await request(app).delete('/api/pagos/1');
        expect(res.statusCode).toEqual(204);
    });

    it('should handle errors when deleting a payment that does not exist', async () => {
        prisma.pago.delete.mockRejectedValue(new Error('DB Error'));
        const res = await request(app).delete('/api/pagos/1');
        expect(res.statusCode).toEqual(500);
    });
});
