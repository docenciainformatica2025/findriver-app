const { db } = require('../config/firebase');
const fs = require('fs');
const path = require('path');

// Load env vars if running directly
if (!process.env.FIREBASE_PROJECT_ID) {
    require('dotenv').config({ path: '../../.env' });
}

async function backupCollection(collectionName) {
    console.log(`[Backup] Reading ${collectionName}...`);
    const snapshot = await db.collection(collectionName).get();
    return snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
    }));
}

async function runBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../../backups');

    // Ensure backup dir exists
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    const filename = `backup_${timestamp}.json`;
    const filePath = path.join(backupDir, filename);

    try {
        console.log('[Backup] Starting Full Database Backup...');

        const data = {
            metadata: {
                timestamp: new Date().toISOString(),
                version: '1.0'
            },
            users: await backupCollection('users'),
            vehicles: await backupCollection('vehicles'),
            transactions: await backupCollection('transactions')
        };

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        console.log(`[Backup] Success! ✅`);
        console.log(`[Backup] Saved to: ${filePath}`);
        console.log(`[Stats] Users: ${data.users.length}, Vehicles: ${data.vehicles.length}, Transactions: ${data.transactions.length}`);

        process.exit(0);
    } catch (error) {
        console.error('[Backup] Failed:', error);
        process.exit(1);
    }
}

runBackup();
