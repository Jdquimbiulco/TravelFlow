describe('Database Configuration', () => {
    let originalEnv;

    beforeEach(() => {
        jest.resetModules(); // clears the cache
        originalEnv = process.env.DATABASE_URL;
        
        // Mock dotenv to prevent reloading from .env
        jest.mock('dotenv', () => ({
            config: jest.fn()
        }));
    });

    afterEach(() => {
        process.env.DATABASE_URL = originalEnv;
        jest.unmock('dotenv');
    });

    it('should throw an error if DATABASE_URL is not defined', () => {
        process.env.DATABASE_URL = '';
        expect(() => {
            require('../src/config/db');
        }).toThrow('DATABASE_URL is not defined. Ensure env file exists and includes DATABASE_URL.');
    });

    it('should successfully initialize if DATABASE_URL is defined', () => {
        process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/mydb';
        const db = require('../src/config/db');
        expect(db).toBeDefined();
    });
});
