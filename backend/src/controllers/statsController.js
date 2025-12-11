const Transaction = require('../models/Transaction');
const Shift = require('../models/Shift');
const Vehicle = require('../models/Vehicle');
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
                                            {
                                                $and: [
                                                    { $eq: ['$tipo', 'gasto'] },
                                                    {
                                                        $in: ['$categoria', ['Combustible', 'Gasolina', 'Fuel', 'fuel', 'combustible']]
                                                    }
                                                ]
                                            },
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

        // 3. Obtener datos del vehículo para estimación
        // Intentar buscar vehículo activo del usuario
        let vehicle = null;
        try {
            // Vehicle.findOne returns a promise that resolves to a Vehicle instance or null
            // We need to use valid syntax for the static method if it exists, or find array
            const vehicles = await Vehicle.find({ userId: userId.toString(), activo: true });
            if (vehicles && vehicles.length > 0) {
                vehicle = vehicles[0];
            }
        } catch (vErr) {
            logger.warn('No se pudo obtener vehículo para estimación', vErr);
        }

        // Datos del vehículo para cálculo (defaults si no hay settings)
        // Rendimiento: km por peso (e.g. 12km/l / $22.5/l ~= 0.53 km/$) -> No, más bien Costo = Litros * Precio.
        // Necesitamos rendimiento (km/l) y precio gasolina ($/l)
        // Default: 10 km/l y $24/l => Costo/Km = 24/10 = $2.4/km

        // Mejor aproximación inversa: Si gasté $1000 de gasolina, cuantos km recorrí?
        // Litros = $1000 / PrecioLitro
        // Km = Litros * Rendimiento

        const fuelPrice = (vehicle && vehicle.config && vehicle.config.fuelPrice) || 24; // $24 MXN por litro default
        const fuelEfficiency = (vehicle && vehicle.config && vehicle.config.fuelEfficiency) || 10; // 10 km/l default

        // 4. Cálculos Derivados (CPK)
        let totalKm = shifts.totalKm;
        let isEstimatedKm = false;

        // Fallback: Si no hay km registrados (o son absurdamente bajos) y hay gasto de gasolina, estimar
        if ((!totalKm || totalKm < 10) && totals.combustible > 0) {
            const liters = totals.combustible / fuelPrice;
            const estimatedKm = liters * fuelEfficiency;

            // Usar la estimación si es mayor que lo registrado
            if (estimatedKm > totalKm) {
                totalKm = estimatedKm;
                isEstimatedKm = true;
            }
        }

        // Asegurar que no sea cero para divisiones
        const finalTotalKm = totalKm || 1;

        const cpk = totals.gastos / finalTotalKm;
        const utilidadNeta = totals.ingresos - totals.gastos;
        const rentabilidadPorKm = utilidadNeta / finalTotalKm;

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
                    totalKm: parseFloat(finalTotalKm.toFixed(1)), // Usar el calculado (real o estimado)
                    isEstimatedKm,
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
