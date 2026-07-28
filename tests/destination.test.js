const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

jest.mock('../src/config/db', () => ({
    destino: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

describe('Destination Endpoints', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockDestination = {
        id: 1,
        nombre: 'Playa Test',
        pais: 'Testlandia',
        ciudad: 'Testville',
        precioPorDia: 100,
        cuposDisponibles: 5,
        estado: 'ACTIVO'
    };

    it('should get all destinations', async () => {
        prisma.destino.findMany.mockResolvedValue([mockDestination]);
        const res = await request(app).get('/api/destinos');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([mockDestination]);
        expect(prisma.destino.findMany).toHaveBeenCalled();
    });

    it('should handle errors when getting all destinations', async () => {
        prisma.destino.findMany.mockRejectedValue(new Error('DB Error'));
        const res = await request(app).get('/api/destinos');
        expect(res.statusCode).toEqual(500);
    });

    it('should get destination by id', async () => {
        prisma.destino.findUnique.mockResolvedValue(mockDestination);
        const res = await request(app).get('/api/destinos/1');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(mockDestination);
        expect(prisma.destino.findUnique).toHaveBeenCalledWith({
            where: { id: 1 }
        });
    });

    it('should return 404 if destination not found', async () => {
        prisma.destino.findUnique.mockResolvedValue(null);
        const res = await request(app).get('/api/destinos/999');
        expect(res.statusCode).toEqual(404);
    });

    it('should handle errors when getting destination by id', async () => {
        prisma.destino.findUnique.mockRejectedValue(new Error('DB Error'));
        const res = await request(app).get('/api/destinos/1');
        expect(res.statusCode).toEqual(500);
    });

    it('should create a new destination with valid data', async () => {
        prisma.destino.create.mockResolvedValue(mockDestination);
        const res = await request(app)
            .post('/api/destinos')
            .send({
                nombre: 'Playa Test',
                pais: 'Testlandia',
                ciudad: 'Testville',
                precioPorDia: 100,
                cuposDisponibles: 5
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual(mockDestination);
        expect(prisma.destino.create).toHaveBeenCalled();
    });

    it('should handle errors when creating a destination', async () => {
        prisma.destino.create.mockRejectedValue(new Error('DB Error'));
        const res = await request(app)
            .post('/api/destinos')
            .send({
                nombre: 'Playa Test',
                pais: 'Testlandia',
                ciudad: 'Testville',
                precioPorDia: 100,
                cuposDisponibles: 5
            });
        expect(res.statusCode).toEqual(500);
    });

    it('should update a destination', async () => {
        prisma.destino.update.mockResolvedValue(mockDestination);
        const res = await request(app)
            .put('/api/destinos/1')
            .send({
                nombre: 'Playa Test 2',
                pais: 'Testlandia',
                ciudad: 'Testville',
                precioPorDia: 120,
                cuposDisponibles: 10
            });
        expect(res.statusCode).toEqual(200);
        expect(prisma.destino.update).toHaveBeenCalled();
    });

    it('should handle errors when updating a destination', async () => {
        prisma.destino.update.mockRejectedValue(new Error('DB Error'));
        const res = await request(app)
            .put('/api/destinos/1')
            .send({
                nombre: 'Playa Test',
                pais: 'Testlandia',
                ciudad: 'Testville',
                precioPorDia: 100,
                cuposDisponibles: 5
            });
        expect(res.statusCode).toEqual(500);
    });

    it('should delete a destination', async () => {
        prisma.destino.delete.mockResolvedValue(mockDestination);
        const res = await request(app).delete('/api/destinos/1');
        expect(res.statusCode).toEqual(204);
        expect(prisma.destino.delete).toHaveBeenCalledWith({
            where: { id: 1 }
        });
    });

    it('should handle errors when deleting a destination', async () => {
        prisma.destino.delete.mockRejectedValue(new Error('DB Error'));
        const res = await request(app).delete('/api/destinos/1');
        expect(res.statusCode).toEqual(500);
    });

    // Validation tests
    it('should reject missing fields on creation', async () => {
        const res = await request(app)
            .post('/api/destinos')
            .send({
                nombre: 'Playa Test'
                // missing other fields
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ path: 'pais' }),
                expect.objectContaining({ path: 'ciudad' }),
                expect.objectContaining({ path: 'cuposDisponibles' }),
                expect.objectContaining({ path: 'precioPorDia' }),
            ])
        );
    });

    it('should reject invalid types on creation', async () => {
        const res = await request(app)
            .post('/api/destinos')
            .send({
                nombre: 'Playa',
                pais: 'Pais',
                ciudad: 'Ciudad',
                precioPorDia: -10, // Invalid (min: 0)
                cuposDisponibles: -1 // Invalid (min: 0)
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ path: 'cuposDisponibles' }),
                expect.objectContaining({ path: 'precioPorDia' })
            ])
        );
    });
});
