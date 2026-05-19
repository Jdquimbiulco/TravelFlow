require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

describe('Destination Endpoints', () => {
  let createdDestinoId;

  // Test 1: Crear un destino con datos válidos
  it('should create a destination with valid data', async () => {
    const res = await request(app)
      .post('/api/destinos')
      .send({
        nombre: `Destino Test ${Date.now()}`,
        pais: 'Ecuador',
        ciudad: 'Quito',
        precioPorDia: 150.5,
        cuposDisponibles: 10,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.pais).toBe('Ecuador');
    expect(res.body.ciudad).toBe('Quito');
    createdDestinoId = res.body.id;
  });

  // Test 2: Obtener todos los destinos
  it('should get all destinations', async () => {
    const res = await request(app).get('/api/destinos');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test 3: Obtener un destino por su ID
  it('should get a destination by id', async () => {
    const res = await request(app).get(`/api/destinos/${createdDestinoId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', createdDestinoId);
    expect(res.body).toHaveProperty('nombre');
    expect(res.body).toHaveProperty('pais', 'Ecuador');
  });

  // Test 4: Forzar un error de validación (precio negativo)
  it('should reject invalid destination data with status 400', async () => {
    const res = await request(app)
      .post('/api/destinos')
      .send({
        nombre: 'Destino Inválido',
        pais: 'Ecuador',
        ciudad: 'Quito',
        precioPorDia: -50,
        cuposDisponibles: 5,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'precioPorDia' }),
      ]),
    );
  });

  afterAll(async () => {
    if (createdDestinoId) {
      await request(app).delete(`/api/destinos/${createdDestinoId}`);
    }
    await prisma.$disconnect();
  });
});
