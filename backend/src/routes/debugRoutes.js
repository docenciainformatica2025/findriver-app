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

        // Fetch last 10 transactions (Optimized to avoid composite index requirement for debug)
        const txSnapshot = await db.collection('transactions')
            .where('userId', '==', userId)
            .limit(10)
            .get(); // Removed orderBy just to be safe in debug

        const transactions = txSnapshot.docs.map(doc => ({
            _id: doc.id,
            ...doc.data()
        }));

        // Manual sort for display
        transactions.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

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

// @route   GET /api/v1/debug/diagnose-db
// @desc    Run the problematic query and return FULL error
router.get('/diagnose-db', async (req, res) => {
    try {
        const testUserId = 'test_user_id';

        // 1. Test Basic Connection
        const collections = await db.listCollections();
        const collectionNames = collections.map(c => c.id);

        // 2. Test Transaction Model Logic
        console.log("Attempting fetch all...");
        const allSnapshot = await db.collection('transactions').limit(50).get();
        const docs = allSnapshot.docs.map(d => d.data());

        res.json({
            success: true,
            collections: collectionNames,
            basic_access: 'ok',
            docs_preview: docs.length,
            message: 'Database connection and basic queries are working.'
        });

    } catch (error) {
        console.error("DIAGNOSTIC ERROR:", error);
        res.status(500).json({
            success: false,
            error_message: error.message,
            error_code: error.code,
            error_stack: error.stack,
            type: 'DIAGNOSTIC_FAILURE'
        });
    }
});

module.exports = router;
