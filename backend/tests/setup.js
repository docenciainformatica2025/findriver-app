const mongoose = require('mongoose');

// Mock Authentication Middleware globally
jest.mock('../src/middlewares/auth', () => ({
    authenticate: (req, res, next) => {
        req.user = {
            id: '507f1f77bcf86cd799439011', // Dummy Mongo ID
            email: 'test@findriver.com',
            vehiculos: []
        };
        next();
    },
    authorize: (...roles) => (req, res, next) => next()
}));

beforeAll(async () => {
    // Connect to a test database if env var is set, else mock
    if (process.env.MONGO_URI_TEST) {
        await mongoose.connect(process.env.MONGO_URI_TEST);
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});
