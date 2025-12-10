const assert = require('assert');

// Logico a probar (Simulada de User.js)
async function calculateDailySummary(mockDb, userId) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`[TEST] Buscando transacciones entre ${startOfDay.toISOString()} y ${endOfDay.toISOString()}`);

    // Simular Query a Firestore
    const transactions = mockDb.filter(t =>
        t.userId === userId &&
        t.fecha >= startOfDay.toISOString() &&
        t.fecha <= endOfDay.toISOString()
    );

    let ingresos = 0;
    let gastos = 0;
    let viajes = 0;

    transactions.forEach(data => {
        if (data.tipo === 'ingreso') {
            ingresos += data.monto || 0;
            viajes++;
        } else if (data.tipo === 'gasto') {
            gastos += data.monto || 0;
        }
    });

    return {
        ingresos,
        gastos,
        ganancia: ingresos - gastos,
        viajes
    };
}

// Datos de Prueba
const mockUserId = 'user123';
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const mockDb = [
    { userId: 'user123', tipo: 'ingreso', monto: 6000, fecha: today.toISOString(), descripcion: 'Viaje Uber' }, // Debería contar
    { userId: 'user123', tipo: 'gasto', monto: 50000, fecha: today.toISOString(), descripcion: 'Gasolina' }, // Debería contar
    { userId: 'user123', tipo: 'ingreso', monto: 10000, fecha: yesterday.toISOString(), descripcion: 'Viaje Ayer' }, // NO debería contar
    { userId: 'otherUser', tipo: 'ingreso', monto: 5000, fecha: today.toISOString(), descripcion: 'Otro usuario' } // NO debería contar
];

// Ejecución de Prueba
console.log('--- Iniciando Prueba de Lógica de Cálculo ---');
calculateDailySummary(mockDb, mockUserId).then(result => {
    console.log('Resultado:', result);

    try {
        assert.strictEqual(result.ingresos, 6000, 'Ingresos incorrectos');
        assert.strictEqual(result.gastos, 50000, 'Gastos incorrectos');
        assert.strictEqual(result.ganancia, -44000, 'Ganancia incorrecta');
        assert.strictEqual(result.viajes, 1, 'Conteo de viajes incorrecto');
        console.log('✅ PRUEBA PASADA: La lógica de cálculo es correcta.');
    } catch (e) {
        console.error('❌ PRUEBA FALLIDA:', e.message);
        process.exit(1);
    }
});
