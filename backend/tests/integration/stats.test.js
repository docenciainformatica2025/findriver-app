const request = require('supertest');
const app = require('../src/app'); // Assuming you export app from server or app.js
const mongoose = require('mongoose');

describe('CPK Stats Endpoints', () => {
    it('GET /api/v1/stats/cpk should return 200 and correct structure', async () => {
        const res = await request(app).get('/api/v1/stats/cpk');

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('summary');
        expect(res.body.data).toHaveProperty('history');

        // Validate Summary Structure
        const summary = res.body.data.summary;
        expect(summary).toHaveProperty('ingresos');
        expect(summary).toHaveProperty('gastos');
        expect(summary).toHaveProperty('cpk');
    });
});
