const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Shift = require('../models/Shift');
const Vehicle = require('../models/Vehicle');
const logger = require('../utils/logger');
const { db } = require('../config/firebase'); // Accesing Firestore directly

// @desc    Obtener estadisticas completas de CPK
// @route   GET /api/v1/stats/cpk
exports.getCPKStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;

        // Definir rango de fechas (default: últimos 30 días)
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(end.getDate() - 30));

        // Ajustar estricto a ISO string para filtros de Firestore
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        const startIso = start.toISOString();
        const endIso = end.toISOString();

        // 1. Obtener Transacciones (In-Memory Aggregation)
        // Firestore requires composite index for Range + Equality. To avoid this dependency,
        // we fetch by userId (Equality) and filter range in memory.
        const txSnap = await db.collection('transactions')
            .where('userId', '==', userId)
            // .where('fecha', '>=', startIso) // Removed to avoid index error
            // .where('fecha', '<=', endIso)   // Removed to avoid index error
            .get();

        const transactions = txSnap.docs
            .map(doc => doc.data())
            .filter(tx => {
                const txDate = tx.fecha || new Date().toISOString();
                return txDate >= startIso && txDate <= endIso;
            });

        // Procesar transacciones en memoria
        const totals = {
            ingresos: 0,
            gastos: 0,
            combustible: 0,
            otrosGastos: 0
        };

        const dailyMap = new Map();

        // Categorías de combustible normalizadas
        const fuelCategories = ['combustible', 'gasolina', 'fuel'];

        transactions.forEach(tx => {
            const monto = Number(tx.monto) || 0;
            const fechaKey = (tx.fecha || new Date().toISOString()).split('T')[0];
            const categoria = (tx.categoria || tx.category || 'other').toLowerCase();

            // Inicializar día si no existe
            if (!dailyMap.has(fechaKey)) {
                dailyMap.set(fechaKey, { date: fechaKey, ingresos: 0, gastos: 0 });
            }
            const dayStats = dailyMap.get(fechaKey);

            if (tx.tipo === 'ingreso') {
                totals.ingresos += monto;
                dayStats.ingresos += monto;
            } else if (tx.tipo === 'gasto') {
                totals.gastos += monto;
                dayStats.gastos += monto;

                if (fuelCategories.includes(categoria)) {
                    totals.combustible += monto;
                } else {
                    totals.otrosGastos += monto;
                }
            }
        });

        // 2. Obtener Jornadas (Shifts) para Km
        const shiftSnap = await db.collection('shifts')
            .where('userId', '==', userId)
            // .where('fechaInicio', '>=', startIso) // Removed
            // .where('estado', '==', 'cerrado')     // Removed
            .get();

        const shifts = shiftSnap.docs
            .map(doc => doc.data())
            .filter(shift => {
                // In-memory filter
                const sDate = shift.fechaInicio;
                const matchesDate = sDate >= startIso && sDate <= endIso;
                const matchesStatus = shift.estado === 'cerrado';
                return matchesDate && matchesStatus;
            });

        // Add Shift KM to Daily Map
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

        // Generate History AFTER merging shifts
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

        // 3. Lógica de Respaldo para Km (Estimación Inteligente)
        let totalKm = shiftStats.totalKm;
        let isEstimatedKm = false;

        // Obtener config del vehículo para estimación
        let vehicle = null;
        try {
            const vehicleSnap = await db.collection('vehicles')
                .where('userId', '==', userId)
                .where('activo', '==', true)
                .limit(1)
                .get();

            if (!vehicleSnap.empty) {
                vehicle = vehicleSnap.docs[0].data();
            }
        } catch (e) {
            logger.warn('Error fetching vehicle for CPK estimate', e);
        }

        const fuelPrice = (vehicle?.config?.fuelPrice) || 24;
        const fuelEfficiency = (vehicle?.config?.fuelEfficiency) || 10;

        // Si no hay Km registrados pero hay gasto de combustible, estimar
        if ((!totalKm || totalKm < 10) && totals.combustible > 0) {
            const liters = totals.combustible / fuelPrice;
            const estimatedKm = liters * fuelEfficiency;

            // Usar la estimación si es mayor que lo registrado (o si no hay nada registrado)
            if (estimatedKm > totalKm) {
                totalKm = estimatedKm;
                isEstimatedKm = true;
            }
        }

        const finalTotalKm = totalKm || 1; // Evitar div/0
        const cpk = totals.gastos / finalTotalKm;
        const utilidadNeta = totals.ingresos - totals.gastos;

        // Identify Today's Stats (Server Time)
        // Use the 'end' date which defaults to Today
        const todayKey = end.toISOString().split('T')[0];
        const todayStats = dailyMap.get(todayKey) || { ingresos: 0, gastos: 0, totalKm: 0 };
        // Ensure derived fields
        todayStats.utilidad = todayStats.ingresos - todayStats.gastos;

        res.json({
            success: true,
            data: {
                summary: {
                    ingresos: totals.ingresos,
                    gastos: totals.gastos,
                    utilidad: utilidadNeta,
                    cpk: parseFloat(cpk.toFixed(2)),
                    totalKm: parseFloat(finalTotalKm.toFixed(1)),
                    isEstimatedKm,
                    kmMuertos: shiftStats.kmMuertos,
                    eficienciaKm: shiftStats.totalKm > 0 ? ((shiftStats.totalKm - shiftStats.kmMuertos) / shiftStats.totalKm) * 100 : 0
                },
                today: todayStats, // Explicit Today Stats
                breakdown: {
                    combustible: totals.combustible,
                    otros: totals.otrosGastos
                },
                history
            }
        });

    } catch (error) {
        logger.error('Error en CPK Stats', error);
        res.status(500).json({ success: false, error: 'Error calculando estadísticas' });
    }
};
