const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const admin = require('../src/config/firebase');
const db = admin.db;

const TARGET_EMAIL = 'antonio_rburgos@msn.com';

async function probeApiResponse() {
    console.log('--- Probing API Response Structure ---');

    // 1. Get User
    const userSnap = await db.collection('users').where('email', '==', TARGET_EMAIL).limit(1).get();
    if (userSnap.empty) { console.log('User not found'); return; }
    const userId = userSnap.docs[0].id;

    // 2. Logic simulation (Exact match of statsController.js)
    const end = new Date();
    const start = new Date(new Date().setDate(end.getDate() - 30));
    start.setHours(0, 0, 0, 0); // UTC Midnight
    end.setHours(23, 59, 59, 999);
    const startIso = start.toISOString();
    const endIso = end.toISOString();

    // Fetch Shifts
    const shiftSnap = await db.collection('shifts')
        .where('userId', '==', userId)
        .get();

    const shifts = shiftSnap.docs.map(doc => doc.data())
        .filter(shift => {
            const sDate = shift.fechaInicio;
            return sDate >= startIso && sDate <= endIso && shift.estado === 'cerrado';
        });

    const dailyMap = new Map();
    shifts.forEach(shift => {
        const fechaKey = (shift.fechaInicio || new Date().toISOString()).split('T')[0];
        const km = Number(shift.totalKm) || 0;

        if (!dailyMap.has(fechaKey)) {
            dailyMap.set(fechaKey, { date: fechaKey, ingresos: 0, gastos: 0, totalKm: 0 });
        }
        const dayStats = dailyMap.get(fechaKey);
        if (dayStats.totalKm === undefined) dayStats.totalKm = 0;
        dayStats.totalKm += km;
    });

    const history = Array.from(dailyMap.values())
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Identify Today (UTC)
    const todayKey = end.toISOString().split('T')[0];
    const todayStats = dailyMap.get(todayKey) || { ingresos: 0, gastos: 0, totalKm: 0 };

    console.log('DATE DIAGNOSIS:');
    console.log(`Server "End Date": ${end.toISOString()}`);
    console.log(`Server "Today Key" (UTC): ${todayKey}`);
    console.log('--- History Keys Found ---');
    history.forEach(h => console.log(`Key: "${h.date}" | KM: ${h.totalKm}`));

    console.log('--------------------------');
    console.log('Today Stats (UTC):', JSON.stringify(todayStats));

}

probeApiResponse().then(() => process.exit(0));
