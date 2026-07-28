const { errorHandler } = require('../src/middlewares/error.middleware');

describe('Error Middleware', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    let originalEnv;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
        originalEnv = process.env.NODE_ENV;
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
        jest.restoreAllMocks();
    });

    it('should handle error with status code and message in development', () => {
        process.env.NODE_ENV = 'development';
        const err = new Error('Custom Error');
        err.statusCode = 400;
        
        errorHandler(err, mockRequest, mockResponse, mockNext);

        expect(console.error).toHaveBeenCalledWith(err.stack);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            statusCode: 400,
            message: 'Custom Error',
            stack: err.stack
        });
    });

    it('should handle error without status code and message in production', () => {
        process.env.NODE_ENV = 'production';
        const err = new Error();
        delete err.message;
        
        errorHandler(err, mockRequest, mockResponse, mockNext);

        expect(console.error).toHaveBeenCalledWith(err.stack);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error'
        });
    });
});
