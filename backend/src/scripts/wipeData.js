const { db, admin } = require('../config/firebase');
const logger = require('../utils/logger');

// Load env vars if running directly
if (!process.env.FIREBASE_PROJECT_ID) {
    require('dotenv').config({ path: '../../.env' });
}

async function wipeCollection(collectionName) {
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
        console.log(`[Wipe] Collection ${collectionName} is empty.`);
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`[Wipe] Deleted ${snapshot.size} documents from ${collectionName}.`);
}

async function wipeEncryptedUsers(email) {
    // Specifically target the user if needed, or all users for a full reset
    // For now, full reset as requested
    console.log('[Wipe] Starting Full Database Wipe...');

    try {
        await wipeCollection('users');
        await wipeCollection('vehicles');
        await wipeCollection('transactions');

        console.log('[Wipe] Database Wipe Completed Successfully. ✅');
        process.exit(0);
    } catch (error) {
        console.error('[Wipe] Error wiping database:', error);
        process.exit(1);
    }
}

wipeEncryptedUsers();
