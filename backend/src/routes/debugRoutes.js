const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @route   GET /api/v1/debug/status
// @desc    Check server version and DB connection
// @access  Public
router.get('/status', async (req, res) => {
    try {
        const testRef = db.collection('_diagnostics').doc('health_check');
        await testRef.set({ last_check: new Date().toISOString() });

        res.json({
            status: 'online',
            version: '1.2.0-fix-persistence', // Bump this to verify deployment
            timestamp: new Date().toISOString(),
            db_connection: 'connected',
            env: process.env.NODE_ENV
        });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// @route   GET /api/v1/debug/user-data/:email
// @desc    Inspect raw DB data for a user by email
// @access  Public (Protected by secret query param for safety in real prod, but simple here)
router.get('/user-data/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();

        if (userSnapshot.empty) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        const userId = userDoc.id;

        // Fetch last 10 transactions
        const txSnapshot = await db.collection('transactions')
            .where('userId', '==', userId)
            .orderBy('fecha', 'desc')
            .limit(10)
            .get();

        const transactions = txSnapshot.docs.map(doc => ({
            _id: doc.id,
            ...doc.data()
        }));

        // Run Manual Stats Calc
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayTx = transactions.filter(t => t.fecha >= startOfDay.toISOString());

        // Check User instance logic
        const userInstance = new User({ _id: userId, ...userData });
        const resumenHoy = await userInstance.getResumenHoy();

        res.json({
            user: { _id: userId, email: userData.email, name: userData.nombre },
            transaction_count: transactions.length,
            last_transactions: transactions,
            server_time: new Date().toISOString(),
            start_of_day_utc: startOfDay.toISOString(),
            manual_stats_calc: {
                today_count: todayTx.length,
                today_tx_ids: todayTx.map(t => t._id)
            },
            model_function_result: resumenHoy
        });

    } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

module.exports = router;
