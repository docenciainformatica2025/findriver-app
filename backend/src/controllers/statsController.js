const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Shift = require('../models/Shift');
const logger = require('../utils/logger');

// @desc    Obtener estadisticas completas de CPK
// @route   GET /api/v1/stats/cpk
exports.getCPKStats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const { startDate, endDate } = req.query;

        // Definir rango de fechas (default: últimos 30 días)
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(end.getDate() - 30));

        // Ajustar start al inicio del día y end al final del día
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        // 1. Agregación de Transacciones (Ingresos y Gastos)
        const txStats = await Transaction.aggregate([
            {
                $match: {
                    userId: userId,
                    fecha: { $gte: start, $lte: end }
                }
            },
            {
                $facet: {
                    // Totales generales
                    totals: [
                        {
                            $group: {
                                _id: null,
                                ingresos: { $sum: { $cond: [{ $eq: ['$tipo', 'ingreso'] }, '$monto', 0] } },
                                gastos: { $sum: { $cond: [{ $eq: ['$tipo', 'gasto'] }, '$monto', 0] } },
                                combustible: {
                                    $sum: {
                                        $cond: [
                                            { $and: [{ $eq: ['$tipo', 'gasto'] }, { $eq: ['$categoria', 'Combustible'] }] },
                                            '$monto',
                                            0
                                        ]
                                    }
                                },
                                otrosGastos: {
                                    $sum: {
                                        $cond: [
                                            { $and: [{ $eq: ['$tipo', 'gasto'] }, { $ne: ['$categoria', 'Combustible'] }] },
                                            '$monto',
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    // Datos por día para gráfica
                    daily: [
                        {
                            $group: {
                                _id: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } },
                                ingresos: { $sum: { $cond: [{ $eq: ['$tipo', 'ingreso'] }, '$monto', 0] } },
                                gastos: { $sum: { $cond: [{ $eq: ['$tipo', 'gasto'] }, '$monto', 0] } }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ]
                }
            }
        ]);

        // 2. Agregación de Jornadas (Kilómetros)
        const shiftStats = await Shift.aggregate([
            {
                $match: {
                    userId: userId,
                    fechaInicio: { $gte: start, $lte: end },
                    estado: 'cerrado' // Solo jornadas terminadas
                }
            },
            {
                $group: {
                    _id: null,
                    totalKm: { $sum: '$totalKm' },
                    kmMuertos: { $sum: '$kmMuertos' },
                    diasTrabajados: { $sum: 1 }
                }
            }
        ]);

        const totals = txStats[0].totals[0] || { ingresos: 0, gastos: 0, combustible: 0, otrosGastos: 0 };
        const shifts = shiftStats[0] || { totalKm: 0, kmMuertos: 0, diasTrabajados: 0 };
        const dailyTx = txStats[0].daily;

        // 3. Cálculos Derivados (CPK)
        // Evitar división por cero
        const totalKm = shifts.totalKm || 1;
        const cpk = totals.gastos / totalKm;
        const utilidadNeta = totals.ingresos - totals.gastos;
        const rentabilidadPorKm = utilidadNeta / totalKm;

        // 4. Merge de datos diarios para gráfica completa
        // Nota: Idealmente cruzaríamos con shifts diarios también, por ahora simplificado
        const history = dailyTx.map(day => ({
            date: day._id,
            ingresos: day.ingresos,
            gastos: day.gastos,
            utilidad: day.ingresos - day.gastos
        }));

        res.json({
            success: true,
            data: {
                summary: {
                    ingresos: totals.ingresos,
                    gastos: totals.gastos,
                    utilidad: utilidadNeta,
                    cpk: parseFloat(cpk.toFixed(2)),
                    totalKm: shifts.totalKm,
                    kmMuertos: shifts.kmMuertos,
                    eficienciaKm: shifts.totalKm > 0 ? ((shifts.totalKm - shifts.kmMuertos) / shifts.totalKm) * 100 : 0
                },
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
