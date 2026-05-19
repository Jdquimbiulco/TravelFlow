const userService = require('../src/services/user.service');

jest.mock('../src/services/user.service');

const {
  getAllUsers,
  getUserById,
  loginUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../src/controllers/user.controller');

describe('User Controller', () => {
  const createMockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    res.send = jest.fn(() => res);
    return res;
  };

  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all users with status 200', async () => {
    const users = [{ id: 1, correo: 'a@example.com' }];
    userService.getAllUsers.mockResolvedValue(users);

    const req = {};
    const res = createMockRes();

    await getAllUsers(req, res, next);

    expect(userService.getAllUsers).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(users);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 404 when user is not found by id', async () => {
    userService.getUserById.mockResolvedValue(null);
    const req = { params: { id: '42' } };
    const res = createMockRes();

    await getUserById(req, res, next);

    expect(userService.getUserById).toHaveBeenCalledWith(42);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
  });

  it('should return 200 when user is found by id', async () => {
    const user = { id: 3, correo: 'found@example.com' };
    userService.getUserById.mockResolvedValue(user);
    const req = { params: { id: '3' } };
    const res = createMockRes();

    await getUserById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(user);
  });

  it('should return 400 when login request is missing data', async () => {
    const req = { body: { correo: 'a@example.com' } };
    const res = createMockRes();

    await loginUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Correo y contraseña son requeridos' });
    expect(userService.loginUser).not.toHaveBeenCalled();
  });

  it('should return 401 when login credentials are incorrect', async () => {
    userService.loginUser.mockResolvedValue(null);
    const req = { body: { correo: 'a@example.com', contrasena: 'wrongpass' } };
    const res = createMockRes();

    await loginUser(req, res, next);

    expect(userService.loginUser).toHaveBeenCalledWith('a@example.com', 'wrongpass');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Correo o contraseña incorrectos' });
  });

  it('should return 200 when login is successful', async () => {
    const user = { id: 5, correo: 'ok@example.com' };
    userService.loginUser.mockResolvedValue(user);
    const req = { body: { correo: 'ok@example.com', contrasena: 'Password1' } };
    const res = createMockRes();

    await loginUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(user);
  });

  it('should create a user and return 201', async () => {
    const payload = { correo: 'new@example.com' };
    const result = { id: 7, correo: 'new@example.com' };
    userService.createUser.mockResolvedValue(result);
    const req = { body: payload };
    const res = createMockRes();

    await createUser(req, res, next);

    expect(userService.createUser).toHaveBeenCalledWith(payload);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it('should return 409 when createUser fails with unique constraint', async () => {
    const error = new Error('Duplicate');
    error.code = 'P2002';
    userService.createUser.mockRejectedValue(error);
    const req = { body: { correo: 'dup@example.com' } };
    const res = createMockRes();

    await createUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'El correo o documento de identidad ya está registrado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should update a user and return 200', async () => {
    const result = { id: 11, correo: 'updated@example.com' };
    userService.updateUser.mockResolvedValue(result);
    const req = { params: { id: '11' }, body: { nombre: 'Updated' } };
    const res = createMockRes();

    await updateUser(req, res, next);

    expect(userService.updateUser).toHaveBeenCalledWith(11, { nombre: 'Updated' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it('should return 409 when updateUser fails with unique constraint', async () => {
    const error = new Error('Duplicate update');
    error.code = 'P2002';
    userService.updateUser.mockRejectedValue(error);
    const req = { params: { id: '12' }, body: { correo: 'existing@example.com' } };
    const res = createMockRes();

    await updateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'El correo o documento ya pertenece a otro usuario' });
  });

  it('should delete a user and return 204', async () => {
    userService.deleteUser.mockResolvedValue();
    const req = { params: { id: '9' } };
    const res = createMockRes();

    await deleteUser(req, res, next);

    expect(userService.deleteUser).toHaveBeenCalledWith(9);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should forward unexpected errors to next', async () => {
    const error = new Error('Unexpected');
    userService.deleteUser.mockRejectedValue(error);
    const req = { params: { id: '100' } };
    const res = createMockRes();

    await deleteUser(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
