const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');

describe('Health Check Endpoint', () => {

    // Close database connection after all tests
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should return 200 OK and status info', async () => {
        const res = await request(app).get('/health');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'OK');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('uptime');
        expect(res.body).toHaveProperty('database');
    });

    it('should return 200 OK and basic info for root path', async () => {
        const res = await request(app).get('/');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('version');
        expect(res.body).toHaveProperty('endpoints');
    });
});
