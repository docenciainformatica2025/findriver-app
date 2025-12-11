const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const admin = require('../src/config/firebase');
const db = admin.db;

const TARGET_EMAIL = 'antonio_rburgos@msn.com';

async function simulateStats() {
    console.log('--- Simulating Stats Controller Output ---');

    // 1. Get User ID
    const userSnap = await db.collection('users').where('email', '==', TARGET_EMAIL).limit(1).get();
    if (userSnap.empty) {
        // Try fallback
        const userSnap2 = await db.collection('users').where('correo', '==', TARGET_EMAIL).limit(1).get();
        if (userSnap2.empty) { console.log('User not found'); return; }
        var userId = userSnap2.docs[0].id;
    } else {
        var userId = userSnap.docs[0].id;
    }
    console.log(`User: ${userId}`);

    // LOGIC COPY FROM statsController.js
    const end = new Date();
    const start = new Date(new Date().setDate(end.getDate() - 30));
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    const startIso = start.toISOString();
    const endIso = end.toISOString();

    const txSnap = await db.collection('transactions')
        .where('userId', '==', userId)
        .get();

    const transactions = txSnap.docs
        .map(doc => doc.data())
        .filter(tx => {
            const txDate = tx.fecha || new Date().toISOString();
            return txDate >= startIso && txDate <= endIso;
        });

    const totals = { ingresos: 0, gastos: 0, combustible: 0, otrosGastos: 0 };
    const dailyMap = new Map();
    const fuelCategories = ['combustible', 'gasolina', 'fuel'];

    transactions.forEach(tx => {
        const monto = Number(tx.monto) || 0;
        const fechaKey = (tx.fecha || new Date().toISOString()).split('T')[0];
        const categoria = (tx.categoria || tx.category || 'other').toLowerCase();

        if (!dailyMap.has(fechaKey)) {
            dailyMap.set(fechaKey, { date: fechaKey, ingresos: 0, gastos: 0, totalKm: 0 }); // Init totalKm here too
        }
        const dayStats = dailyMap.get(fechaKey);

        if (tx.tipo === 'ingreso') {
            totals.ingresos += monto;
            dayStats.ingresos += monto;
        } else if (tx.tipo === 'gasto') {
            totals.gastos += monto;
            dayStats.gastos += monto;
            if (fuelCategories.includes(categoria)) totals.combustible += monto;
            else totals.otrosGastos += monto;
        }
    });

    const shiftSnap = await db.collection('shifts')
        .where('userId', '==', userId)
        .get();

    const shifts = shiftSnap.docs
        .map(doc => doc.data())
        .filter(shift => {
            const sDate = shift.fechaInicio;
            const matchesDate = sDate >= startIso && sDate <= endIso;
            const matchesStatus = shift.estado === 'cerrado';
            return matchesDate && matchesStatus;
        });

    console.log(`Found ${shifts.length} valid shifts.`);

    shifts.forEach(shift => {
        const fechaKey = (shift.fechaInicio || new Date().toISOString()).split('T')[0];
        const km = Number(shift.totalKm) || 0;
        console.log(`Shift Date (UTC Key): ${fechaKey} | KM: ${km}`);

        if (!dailyMap.has(fechaKey)) {
            dailyMap.set(fechaKey, { date: fechaKey, ingresos: 0, gastos: 0, totalKm: 0 });
        }
        const dayStats = dailyMap.get(fechaKey);
        if (dayStats.totalKm === undefined) dayStats.totalKm = 0;
        dayStats.totalKm += km;
    });

    const history = Array.from(dailyMap.values())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(d => ({
            ...d,
            utilidad: d.ingresos - d.gastos,
            totalKm: d.totalKm || 0
        }));

    const shiftStats = shifts.reduce((acc, curr) => ({
        totalKm: acc.totalKm + (curr.totalKm || 0),
        kmMuertos: acc.kmMuertos + (curr.kmMuertos || 0)
    }), { totalKm: 0, kmMuertos: 0 });

    const finalTotalKm = shiftStats.totalKm || 1;
    const cpk = totals.gastos / finalTotalKm;

    console.log('\n--- SIMULATION RESULTS ---');
    console.log('Summary CPK:', cpk);
    console.log('Summary TotalKm:', finalTotalKm);

    // Find TODAY's entry
    // Frontend uses moment().format('YYYY-MM-DD') which is LOCAL time.
    // Backend uses UTC split('T')[0].

    // Let's print history to see the dates
    console.log('\n--- HISTORY (Daily) ---');
    history.forEach(h => console.log(JSON.stringify(h)));

}

simulateStats().then(() => process.exit(0));
