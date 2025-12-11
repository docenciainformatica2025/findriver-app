const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const admin = require('../src/config/firebase');
const db = admin.db;
const auth = admin.admin.auth();

const TARGET_EMAIL = 'antonio_rburgos@msn.com';

async function injectDataForEmail() {
    console.log(`--- Locating User: ${TARGET_EMAIL} ---`);
    console.log(`Current Project ID: ${admin.admin.app().options.credential.projectId}`);

    try {
        let userUid = null;

        // 1. Try Authentication Service
        try {
            const userRecord = await auth.getUserByEmail(TARGET_EMAIL);
            console.log(`✅ Found in Auth Service! UID: ${userRecord.uid}`);
            userUid = userRecord.uid;
        } catch (e) {
            console.log(`❌ Auth Service: User not found (${e.code})`);
        }

        // 2. Try Firestore 'users' collection (some apps store profile but not auth here)
        if (!userUid) {
            console.log('Searching Firestore users collection...');
            const snap = await db.collection('users').where('email', '==', TARGET_EMAIL).limit(1).get();
            if (!snap.empty) {
                userUid = snap.docs[0].id;
                console.log(`✅ Found in Firestore (field 'email')! UID: ${userUid}`);
            } else {
                const snap2 = await db.collection('users').where('correo', '==', TARGET_EMAIL).limit(1).get();
                if (!snap2.empty) {
                    userUid = snap2.docs[0].id;
                    console.log(`✅ Found in Firestore (field 'correo')! UID: ${userUid}`);
                }
            }
        }

        if (!userUid) {
            console.log('\n❌ ERROR CRITICO: El usuario NO existe en esta base de datos.');
            console.log('Esto confirma que el entorno local (donde estoy ejecutando scripts) NO es el mismo que Producción.');
            return;
        }

        console.log(`\n✅ USER CONFIRMED: ${userUid}`);

        const today = new Date().toISOString();

        // 1. Inyectar Jornada
        const shiftId = db.collection('shifts').doc().id;
        const shiftData = {
            userId: userUid,
            fechaInicio: today,
            fechaFin: today,
            estado: 'cerrado',
            odometroInicial: 20000,
            odometroFinal: 20150,
            totalKm: 150,
            kmMuertos: 5,
            tiempoConectado: 600,
            createdAt: today
        };
        await db.collection('shifts').doc(shiftId).set(shiftData);
        console.log(`✅ Injected Shift: 150km`);

        // 2. Inyectar Gasolina
        const fuelId = db.collection('transactions').doc().id;
        const fuelData = {
            userId: userUid,
            tipo: 'gasto',
            monto: 800,
            categoria: 'Combustible',
            descripcion: 'TEST DATA - EMAIL TARGET',
            fecha: today,
            createdAt: today
        };
        await db.collection('transactions').doc(fuelId).set(fuelData);
        console.log(`✅ Injected Fuel Expense: $800`);

        // 3. Inyectar Ingreso
        const incomeId = db.collection('transactions').doc().id;
        const incomeData = {
            userId: userUid,
            tipo: 'ingreso',
            monto: 3000,
            categoria: 'Viaje',
            descripcion: 'TEST DATA - INGRESOS',
            fecha: today,
            createdAt: today
        };
        await db.collection('transactions').doc(incomeId).set(incomeData);
        console.log(`✅ Injected Income: $3000`);

        console.log('\n--- DATA READY ---');
        console.log(`Expected CPK for this user: $${(800 / 150).toFixed(2)}/km`);

    } catch (e) {
        console.error('Error:', e);
    }
}

injectDataForEmail().then(() => process.exit(0));
