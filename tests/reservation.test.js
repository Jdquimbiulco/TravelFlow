require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

describe('Reservation Endpoints', () => {
  let testUserId;
  let testDestinoId;
  let createdReservaId;

  beforeAll(async () => {
    const userRes = await request(app).post('/api/usuarios').send({
      correo: `reserva.user.${Date.now()}@test.com`,
      contrasena: 'ValidPass1',
      nombre: 'Cliente Reservas',
    });
    testUserId = userRes.body.id;

    const destRes = await request(app).post('/api/destinos').send({
      nombre: `Destino Reserva ${Date.now()}`,
      pais: 'Ecuador',
      ciudad: 'Quito',
      precioPorDia: 120,
      cuposDisponibles: 8,
    });
    testDestinoId = destRes.body.id;
  });

  // Test 1: Crear una reserva válida
  it('should create a reservation with valid data', async () => {
    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + 3);

    const res = await request(app)
      .post('/api/reservas')
      .send({
        usuarioId: testUserId,
        destinoId: testDestinoId,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        precioTotal: 360,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.usuarioId).toBe(testUserId);
    expect(res.body.destinoId).toBe(testDestinoId);
    expect(res.body.estado).toBe('PENDIENTE');
    createdReservaId = res.body.id;
  });

  // Test 2: Obtener todas las reservas
  it('should get all reservations', async () => {
    const res = await request(app).get('/api/reservas');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test 3: Rechazar datos incompletos
  it('should reject incomplete reservation data', async () => {
    const res = await request(app)
      .post('/api/reservas')
      .send({
        usuarioId: testUserId,
        // No enviamos destinoId ni fechas para forzar la validación
      });

    // Ahora esperamos un 400 Bad Request profesional
    expect(res.statusCode).toEqual(400); 
    // Y verificamos que el guardia (express-validator) haya capturado el error
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'destinoId' }),
      ])
    );
  });

  afterAll(async () => {
    if (createdReservaId) {
      await request(app).delete(`/api/reservas/${createdReservaId}`);
    }
    if (testDestinoId) {
      await request(app).delete(`/api/destinos/${testDestinoId}`);
    }
    if (testUserId) {
      await request(app).delete(`/api/usuarios/${testUserId}`);
    }
    await prisma.$disconnect();
  });
});
