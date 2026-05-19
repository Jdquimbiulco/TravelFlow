require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

jest.setTimeout(20000);

describe('Payment Endpoints', () => {
    let testUserId;
    let testDestinoId;
    let testReservaId;
    let createdPaymentId;

    // Se ejecuta antes de todas las pruebas para preparar los datos necesarios
    beforeAll(async () => {
        // 1. Creamos un Usuario de prueba
        const userRes = await request(app).post('/api/usuarios').send({
            correo: `payer.${Date.now()}@test.com`,
            contrasena: 'ValidPass1',
            nombre: 'Cliente de Pagos',
        });
        testUserId = userRes.body.id;

        // 2. Creamos un Destino de prueba
        const destRes = await request(app).post('/api/destinos').send({
            nombre: 'Playa Test',
            pais: 'Testlandia',
            ciudad: 'Testville',
            precioPorDia: 100,
            cuposDisponibles: 5
        });
        testDestinoId = destRes.body.id;

        // 3. Creamos una Reserva de prueba en estado PENDIENTE
        const dateStart = new Date();
        const dateEnd = new Date();
        dateEnd.setDate(dateEnd.getDate() + 2); // Viaje de 2 días

        const resRes = await request(app).post('/api/reservas').send({
            usuarioId: testUserId,
            destinoId: testDestinoId,
            fechaInicio: dateStart.toISOString(),
            fechaFin: dateEnd.toISOString(),
            precioTotal: 200
        });
        testReservaId = resRes.body.id;
    });

    // PRUEBA 1: Obtener todos los pagos
    it('should get all payments', async () => {
        const res = await request(app).get('/api/pagos');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // PRUEBA 2: Crear un pago válido
    it('should create a payment with valid data', async () => {
        const res = await request(app)
            .post('/api/pagos')
            .send({
                reservaId: testReservaId,
                monto: 200,
                metodo: 'TARJETA',
                codigoTransaccion: `TRX-${Date.now()}`
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.reservaId).toBe(testReservaId);
        expect(res.body.estado).toBe('COMPLETADO');
        createdPaymentId = res.body.id;
    });

    // PRUEBA 3: Rechazar pagos duplicados (la misma reserva)
    it('should reject a second payment for the same reservation', async () => {
        const res = await request(app)
            .post('/api/pagos')
            .send({
                reservaId: testReservaId,
                monto: 200,
                metodo: 'EFECTIVO'
            });

        // Debería fallar porque la reservaId es @unique en la base de datos
        expect(res.statusCode).not.toEqual(201);
    });

    // PRUEBA 4: Anular pago y verificar estado de la reserva
    it('should delete (annul) a payment and revert reservation state', async () => {
        // Borramos el pago
        const deleteRes = await request(app).delete(`/api/pagos/${createdPaymentId}`);
        expect(deleteRes.statusCode).toEqual(204);

        // Verificamos que la reserva regresó a estado PENDIENTE (Regla de negocio)
        const reservaRes = await request(app).get(`/api/reservas/${testReservaId}`);
        expect(reservaRes.body.estado).toBe('PENDIENTE');
    });

    // Limpieza final de la base de datos de pruebas
    afterAll(async () => {
        try {
            if (testReservaId) {
                await request(app).delete(`/api/reservas/${testReservaId}`);
            }
        } catch (err) {
            // ignore cleanup failures
        }

        try {
            if (testUserId) {
                await request(app).delete(`/api/usuarios/${testUserId}`);
            }
        } catch (err) {
            // ignore cleanup failures
        }

        try {
            if (testDestinoId) {
                await request(app).delete(`/api/destinos/${testDestinoId}`);
            }
        } catch (err) {
            // ignore cleanup failures
        }

        // Desconecta Prisma para evitar advertencias de open handles en Jest
        await prisma.$disconnect();
    });
});

// --- CÓDIGO TEMPORAL PARA FORZAR MÚLTIPLES ERRORES ---
//const variableNoUsada = 10 // Error: Falta punto y coma (semi) & Variable no usada (no-unused-vars)
//variableNoUsada = 20;      // Error: Reasignación de constante (no-const-assign)
//console.log(noExiste);    // Error: Variable no declarada/definida (no-undef)

