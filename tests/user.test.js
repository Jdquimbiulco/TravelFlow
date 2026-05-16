const request = require('supertest');
const app = require('../src/app');

describe('User Endpoints', () => {
  const randomEmail = `test.user.${Date.now()}@example.com`;
  let createdUserId;

  // Test para devolver todos los usuarios
  it('should get all users', async () => {
    const res = await request(app).get('/api/usuarios');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test para crear usuario con datos válidos
  it('should create a new user with valid data', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        correo: randomEmail,
        contrasena: 'Password1',
        nombre: 'Juan Perez',
        telefono: '987654321',
        documentoIdentidad: '1234567890',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.correo).toBe(randomEmail);
    expect(res.body.nombre).toBe('Juan Perez');
    createdUserId = res.body.id;
  });

  // Test para rechazar correo con formato erróneo
  it('should reject invalid email format', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        correo: 'invalid-email',
        contrasena: 'Password1',
        nombre: 'Ana Maria',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'correo' }),
      ])
    );
  });


  //Test para rechazar contraseñas con menos de 6 caracteres
  it('should reject short passwords', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        correo: `shortpass.${Date.now()}@example.com`,
        contrasena: '123',
        nombre: 'Ana Maria',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'contrasena' }),
      ])
    );
  });


  //Test para rechazar nombre inválido (con números)
  it('should reject invalid nombre with numbers', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        correo: `nameerror.${Date.now()}@example.com`,
        contrasena: 'Password1',
        nombre: 'Juan123',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'nombre' }),
      ])
    );
  });


  //Test para rechazar teléfonos con menos/más digitos que 9.
  it('should reject invalid telefono length', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        correo: `phoneerror.${Date.now()}@example.com`,
        contrasena: 'Password1',
        nombre: 'Carlos Lopez',
        telefono: '12345',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'telefono' }),
      ])
    );
  });

  
  //Test para rechazar documento de identidad sin formato.
  it('should reject invalid documentoIdentidad format', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        correo: `docerror.${Date.now()}@example.com`,
        contrasena: 'Password1',
        nombre: 'Lucia Ortiz',
        documentoIdentidad: 'ABC12345',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'documentoIdentidad' }),
      ])
    );
  });

  afterAll(async () => {
    if (createdUserId) {
      await request(app).delete(`/api/usuarios/${createdUserId}`);
    }
  });
});
