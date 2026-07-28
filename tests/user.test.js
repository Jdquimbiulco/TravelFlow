const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

jest.mock('../src/config/db', () => ({
  usuario: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('User Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 1,
    correo: 'test@example.com',
    nombre: 'Juan Perez',
    rol: 'CLIENTE',
    fechaRegistro: new Date().toISOString()
  };

  it('should get all users', async () => {
    prisma.usuario.findMany.mockResolvedValue([mockUser]);
    const res = await request(app).get('/api/usuarios');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([mockUser]);
    expect(prisma.usuario.findMany).toHaveBeenCalled();
  });

  it('should handle errors when getting all users', async () => {
    prisma.usuario.findMany.mockRejectedValue(new Error('DB Error'));
    const res = await request(app).get('/api/usuarios');
    expect(res.statusCode).toEqual(500);
  });

  it('should get user by id', async () => {
    prisma.usuario.findUnique.mockResolvedValue(mockUser);
    const res = await request(app).get('/api/usuarios/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(mockUser);
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { id: true, correo: true, nombre: true, rol: true, fechaRegistro: true }
    });
  });

  it('should return 404 if user not found', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/usuarios/999');
    expect(res.statusCode).toEqual(404);
  });

  it('should handle errors when getting user by id', async () => {
    prisma.usuario.findUnique.mockRejectedValue(new Error('DB Error'));
    const res = await request(app).get('/api/usuarios/1');
    expect(res.statusCode).toEqual(500);
  });

  it('should create a new user with valid data', async () => {
    prisma.usuario.create.mockResolvedValue(mockUser);
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        correo: 'test@example.com',
        contrasena: 'Password1',
        nombre: 'Juan Perez',
        telefono: '987654321',
        documentoIdentidad: '1234567890',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual(mockUser);
    expect(prisma.usuario.create).toHaveBeenCalled();
  });

  it('should handle errors when creating a user', async () => {
    prisma.usuario.create.mockRejectedValue(new Error('DB Error'));
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        correo: 'test@example.com',
        contrasena: 'Password1',
        nombre: 'Juan Perez',
        telefono: '987654321',
        documentoIdentidad: '1234567890',
      });
    expect(res.statusCode).toEqual(500);
  });

  it('should update a user', async () => {
    prisma.usuario.update.mockResolvedValue(mockUser);
    const res = await request(app)
      .put('/api/usuarios/1')
      .send({
        correo: 'test2@example.com',
        contrasena: 'Password1',
        nombre: 'Juan Perez',
        telefono: '987654321',
        documentoIdentidad: '1234567890',
      });
    expect(res.statusCode).toEqual(200);
    expect(prisma.usuario.update).toHaveBeenCalled();
  });

  it('should handle errors when updating a user', async () => {
    prisma.usuario.update.mockRejectedValue(new Error('DB Error'));
    const res = await request(app)
      .put('/api/usuarios/1')
      .send({
        correo: 'test2@example.com',
        contrasena: 'Password1',
        nombre: 'Juan Perez',
        telefono: '987654321',
        documentoIdentidad: '1234567890',
      });
    expect(res.statusCode).toEqual(500);
  });

  it('should delete a user', async () => {
    prisma.usuario.delete.mockResolvedValue(mockUser);
    const res = await request(app).delete('/api/usuarios/1');
    expect(res.statusCode).toEqual(204);
    expect(prisma.usuario.delete).toHaveBeenCalled();
  });

  it('should handle errors when deleting a user', async () => {
    prisma.usuario.delete.mockRejectedValue(new Error('DB Error'));
    const res = await request(app).delete('/api/usuarios/1');
    expect(res.statusCode).toEqual(500);
  });

  // Validation tests
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

  it('should reject short passwords', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        correo: 'test@example.com',
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

  it('should reject invalid nombre with numbers', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        correo: 'test@example.com',
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

  it('should reject invalid telefono length', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        correo: 'test@example.com',
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

  it('should reject invalid documentoIdentidad format', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        correo: 'test@example.com',
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
});
