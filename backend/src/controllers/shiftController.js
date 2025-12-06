const Shift = require('../models/Shift');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

// @desc    Iniciar nueva jornada
// @route   POST /api/v1/shifts/start
exports.startShift = async (req, res) => {
    try {
        const { odometro } = req.body;

        // Verificar si ya hay turno abierto
        const activeShift = await Shift.findOne({ userId: req.user.id, estado: 'abierto' });
        if (activeShift) {
            return res.status(400).json({ error: 'Ya tienes una jornada activa' });
        }

        const shift = await Shift.create({
            userId: req.user.id,
            odometroInicial: odometro,
            fechaInicio: new Date()
        });

        res.status(201).json({ success: true, data: shift });
    } catch (error) {
        logger.error('Error iniciando jornada', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Obtener estado actual
// @route   GET /api/v1/shifts/current
exports.getCurrentShift = async (req, res) => {
    try {
        const shift = await Shift.findOne({ userId: req.user.id, estado: 'abierto' });
        res.json({ success: true, data: shift });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Cerrar jornada
// @route   POST /api/v1/shifts/end
exports.endShift = async (req, res) => {
    try {
        const { odometro } = req.body;
        const shift = await Shift.findOne({ userId: req.user.id, estado: 'abierto' });

        if (!shift) {
            return res.status(404).json({ error: 'No hay jornada activa' });
        }

        // Calcular métricas
        // 1. Obtener viajes durante el turno
        const viajes = await Transaction.find({
            userId: req.user.id,
            tipo: 'ingreso', // Asumiendo que 'ingreso' = viaje
            fecha: { $gte: shift.fechaInicio }
        });

        const totalViajes = viajes.length;
        const totalIngresos = viajes.reduce((acc, t) => acc + t.monto, 0);
        const kmRecorridosEnViajes = viajes.reduce((acc, t) => acc + (t.viaje?.distanciaKm || 0), 0);

        shift.totalViajes = totalViajes;
        shift.totalIngresos = totalIngresos;
        shift.kmRecorridosEnViajes = parseFloat(kmRecorridosEnViajes.toFixed(1));

        // Cerrar turno (calcula Total Km)
        await shift.cerrarTurno(odometro);

        // Calcular Km Muertos (Total Km - Km en viajes)
        // Nota: TotalKm ya se calculó en cerrarTurno
        shift.kmMuertos = parseFloat((shift.totalKm - shift.kmRecorridosEnViajes).toFixed(1));
        await shift.save();

        res.json({ success: true, data: shift });
    } catch (error) {
        logger.error('Error cerrando jornada', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
