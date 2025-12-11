const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const admin = require('../src/config/firebase');
const db = admin.db;

const TARGET_EMAIL = 'antonio_rburgos@msn.com';

async function injectKmTransaction() {
    console.log('--- Injecting Transaction with KM for History UI Test ---');

    const userSnap = await db.collection('users').where('email', '==', TARGET_EMAIL).limit(1).get();
    if (userSnap.empty) { console.log('User not found'); return; }
    const userId = userSnap.docs[0].id;

    // Use a time slightly later than previous tests to appear at top
    const now = new Date();
    const fechaISO = now.toISOString();

    const txRef = db.collection('transactions').doc(`TEST_KM_TX_${Date.now()}`);

    const kmValue = 15.5;

    await txRef.set({
        userId,
        monto: 8500,
        tipo: 'ingreso',
        fecha: fechaISO,
        categoria: 'viaje',
        plataforma: 'didi',
        descripcion: 'Viaje Prueba con KM Visible',
        kmRecorridos: kmValue, // Explicit KM
        distanciaViaje: kmValue // Redundancy
    });

    console.log(`-> Injected Income: $8500 with ${kmValue} KM`);
}

injectKmTransaction().then(() => process.exit(0));
