const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const admin = require('../src/config/firebase');
const db = admin.db;

async function scanDatabase() {
    console.log('--- Deep Database Scan ---');
    try {
        const project = admin.admin.app().options.credential.projectId;
        console.log('Target Project ID:', project);

        console.log('Fetching ALL users...');
        const usersSnap = await db.collection('users').get();
        console.log(`Total Users Found: ${usersSnap.size}`);

        if (usersSnap.empty) {
            console.log('⚠️ Database appears empty of users.');
            return;
        }

        let activeUser = null;

        for (const doc of usersSnap.docs) {
            const data = doc.data();
            const uid = doc.id;
            const name = data.nombre || data.name || 'Unknown';

            // Initial check: does he have transactions?
            const txSnap = await db.collection('transactions').where('userId', '==', uid).limit(1).get();
            const hasTx = !txSnap.empty;

            console.log(`- User [${uid}] "${name}": ${hasTx ? 'HAS DATA ✅' : 'No Data ❌'}`);

            if (hasTx) {
                activeUser = uid;
            }
        }

        if (activeUser) {
            console.log(`\nTesting CPK Logic with User: ${activeUser}`);
            // Run the CPK Query Logic
            // 1. Transactions
            const txSnap = await db.collection('transactions').where('userId', '==', activeUser).get();
            console.log(`   Fetched ${txSnap.size} transactions (Equality Query).`);

            // 2. Shifts
            const shiftSnap = await db.collection('shifts').where('userId', '==', activeUser).get();
            console.log(`   Fetched ${shiftSnap.size} shifts (Equality Query).`);

            console.log('✅ Query Logic Validated: No Index Errors thrown.');
        } else {
            console.log('\n❌ No users with data found. Cannot verify CPK logic against real data.');
            console.log('Possible Cause: Local .env points to Dev/Test DB, not Production.');
        }

    } catch (e) {
        console.error('Scan Error:', e);
    }
}

scanDatabase().then(() => process.exit(0));
