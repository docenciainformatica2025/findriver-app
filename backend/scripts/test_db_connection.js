require('dotenv').config();
const { db } = require('../src/config/firebase');

async function testConnection() {
    console.log('--- Testing Firestore Connection ---');
    console.log('Timestamp:', new Date().toISOString());

    try {
        const testRef = db.collection('_diagnostics').doc('connectivity_test');

        console.log('Attempting to write to:', testRef.path);
        await testRef.set({
            timestamp: new Date().toISOString(),
            status: 'ok',
            test: 'write_permission',
            environment: process.env.NODE_ENV || 'unknown'
        });
        console.log('✅ WRITE SUCCESS: Connected and wrote to Firestore.');

        console.log('Attempting to read back...');
        const doc = await testRef.get();
        if (doc.exists) {
            console.log('✅ READ SUCCESS:', doc.data());
        } else {
            console.log('⚠️ READ WARNING: Document written but not found.');
        }

    } catch (error) {
        console.error('❌ CONNECTION ERROR:', error);
        console.error('Stack:', error.stack);

        if (error.code === 7) {
            console.error('HINT: Permission Denied. Check Service Account roles.');
        }
    }
}

testConnection().then(() => process.exit(0));
