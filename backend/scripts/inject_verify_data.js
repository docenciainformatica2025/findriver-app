const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const admin = require('../src/config/firebase');
const db = admin.db;

const TARGET_EMAIL = 'antonio_rburgos@msn.com'; // Verified user

async function injectTodayData() {
    console.log('--- Injecting Data for Today to Verify Income/Km ---');

    // 1. Get User
    const userSnap = await db.collection('users').where('email', '==', TARGET_EMAIL).limit(1).get();
    if (userSnap.empty) { console.log('User not found'); return; }
    const userId = userSnap.docs[0].id;
    console.log(`User ID: ${userId}`);

    // 2. Define "Today" (We want to match the user's Local Date: 2025-12-11)
    // We will use a UTC time that is safely inside the day, e.g., 18:00 UTC (which is 13:00 EST / 12:00 CST)
    const todayStr = '2025-12-11';
    const fechaISO = `${todayStr}T18:00:00.000Z`;

    console.log(`Injecting data for Date: ${todayStr} (ISO: ${fechaISO})`);

    // 3. Inject Shift (The Denominator: 100km)
    const shiftRef = db.collection('shifts').doc(`TEST_SHIFT_${Date.now()}`);
    await shiftRef.set({
        userId,
        fechaInicio: fechaISO,
        fechaFin: fechaISO, // Instant shift
        totalKm: 100, // Explicit 100km for easy math
        kmMuertos: 0,
        estado: 'cerrado', // Crucial for filter
        tiempoTotal: 60,
        ganancia: 2000 // Just metadata
    });
    console.log('-> Injected Shift: 100 KM');

    // 4. Inject Income (The Numerator: $5000)
    // Deleting old incomes for today to keep math clean? No, just add new one.
    // Let's rely on the user seeing the result change.
    // If previous was $3000, new will be $3000 + $5000 = $8000?
    // Let's try to overwrite if possible or just log what we added.
    const txRef = db.collection('transactions').doc(`TEST_INCOME_${Date.now()}`);
    await txRef.set({
        userId,
        monto: 5000, // Explicit $5000
        tipo: 'ingreso',
        fecha: fechaISO,
        categoria: 'uber', // Platform income
        plataforma: 'uber',
        descripcion: 'Ingreso Prueba Verificacion',
        kmRecorridos: 0 // Frontend ignored this, Backend uses Shift. Good test.
    });
    console.log('-> Injected Income: $5000');

    console.log('\n--- EXPECTED CALCULATION ---');
    console.log(`Numerator (Income): $5000 (plus existing)`);
    console.log(`Denominator (Km):   100 km (plus existing)`);
    console.log(`Result:             Income / 100 = $50/km (approx)`);
    console.log('----------------------------');
}

injectTodayData().then(() => process.exit(0));
