const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const logger = require('../utils/logger');
const cloudinary = require('../config/cloudinary');
const { generateExcel } = require('../services/excelService');

// Helper para generar CSV
const generateCSV = async (transactions) => {
    const fields = ['fecha', 'tipo', 'monto', 'categoria', 'descripcion', 'metodoPago'];
    const header = fields.join(',') + '\n';
    const rows = transactions.map(t => {
        const data = {
            fecha: t.fecha ? new Date(t.fecha).toISOString().split('T')[0] : '',
            tipo: t.tipo,
            monto: t.monto,
            categoria: t.categoria,
            descripcion: t.descripcion ? t.descripcion.replace(/,/g, ' ') : '',
            metodoPago: t.viaje?.metodoPago || ''
        };
        return fields.map(field => `"${data[field]}"`).join(',');
    }).join('\n');
    return header + rows;
};

// @desc    Obtener todas las transacciones del usuario
// @route   GET /api/v1/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
    try {
        const {
            pagina = 1,
            limite = 20,
            tipo,
            categoria,
            fechaInicio,
            fechaFin,
            descripcion
        } = req.query;

        const filtros = {
            tipo,
            categoria,
            fechaInicio,
            fechaFin,
            descripcion
        };

        const result = await Transaction.getTransaccionesPaginadas(
            req.user.id,
            parseInt(pagina),
            parseInt(limite),
            filtros
        );

        res.status(200).json({
            success: true,
            count: result.transacciones.length,
            total: result.paginacion.total,
            pagination: result.paginacion,
            data: result.transacciones
        });

    } catch (error) {
        logger.error('Error obteniendo transacciones:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener transacciones'
        });
    }
};

// @desc    Obtener transacción por ID
// @route   GET /api/v1/transactions/:id
// @access  Private
exports.getTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transacción no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: transaction
        });

    } catch (error) {
        logger.error('Error obteniendo transacción:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener transacción'
        });
    }
};

// @desc    Crear nueva transacción
// @route   POST /api/v1/transactions
// @access  Private
exports.createTransaction = async (req, res) => {
    try {
        // Agregar userId a la transacción
        req.body.userId = req.user.id;

        // Si es un viaje, actualizar kilometraje del vehículo
        if (req.body.tipo === 'ingreso' && req.body.viaje?.distanciaKm) {
            const vehicle = await Vehicle.findOne({
                userId: req.user.id,
                principal: true
            });

            if (vehicle) {
                vehicle.estadisticas.kilometrajeActual += req.body.viaje.distanciaKm;
                vehicle.estadisticas.kilometrajeTotal += req.body.viaje.distanciaKm;
                vehicle.estadisticas.viajesTotales += 1;

                if (req.body.viaje.tiempoMinutos) {
                    vehicle.estadisticas.horasUso += req.body.viaje.tiempoMinutos / 60;
                }

                await vehicle.save();
            }
        }

        // Crear transacción
        const transaction = await Transaction.create(req.body);

        // Actualizar estadísticas del usuario
        const user = await User.findById(req.user.id);
        await user.actualizarEstadisticas();

        // Emitir evento de socket (si existe)
        if (req.io) {
            req.io.to(`user:${req.user.id}`).emit('transaction:created', transaction);
        }

        res.status(201).json({
            success: true,
            message: 'Transacción creada exitosamente',
            data: transaction
        });

    } catch (error) {
        logger.error('Error creando transacción:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: 'Error de validación',
                details: errors
            });
        }

        res.status(500).json({
            success: false,
            error: `Error al crear transacción: ${error.message}`
        });
    }
};

// @desc    Actualizar transacción
// @route   PUT /api/v1/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res) => {
    try {
        let transaction = await Transaction.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transacción no encontrada'
            });
        }

        // Actualizar transacción
        transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        // Actualizar estadísticas del usuario
        const user = await User.findById(req.user.id);
        await user.actualizarEstadisticas();

        // Emitir evento de socket
        if (req.io) {
            req.io.to(`user:${req.user.id}`).emit('transaction:updated', transaction);
        }

        res.status(200).json({
            success: true,
            message: 'Transacción actualizada exitosamente',
            data: transaction
        });

    } catch (error) {
        logger.error('Error actualizando transacción:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: 'Error de validación',
                details: errors
            });
        }

        res.status(500).json({
            success: false,
            error: 'Error al actualizar transacción'
        });
    }
};

// @desc    Eliminar transacción
// @route   DELETE /api/v1/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transacción no encontrada'
            });
        }

        // Eliminar archivos de Cloudinary si existen
        if (transaction.archivos && transaction.archivos.length > 0) {
            for (const archivo of transaction.archivos) {
                if (archivo.url.includes('cloudinary')) {
                    const publicId = archivo.url.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                }
            }
        }

        await transaction.deleteOne();

        // Actualizar estadísticas del usuario
        const user = await User.findById(req.user.id);
        await user.actualizarEstadisticas();

        // Emitir evento de socket
        if (req.io) {
            req.io.to(`user:${req.user.id}`).emit('transaction:deleted', req.params.id);
        }

        res.status(200).json({
            success: true,
            message: 'Transacción eliminada exitosamente'
        });

    } catch (error) {
        logger.error('Error eliminando transacción:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar transacción'
        });
    }
};

// @desc    Subir archivo a transacción
// @route   POST /api/v1/transactions/:id/upload
// @access  Private
exports.uploadFile = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transacción no encontrada'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Por favor selecciona un archivo'
            });
        }

        // Subir a Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: `finanzas-conductor/transactions/${req.user.id}`,
            resource_type: 'auto'
        });

        // Agregar archivo a la transacción
        transaction.archivos.push({
            url: result.secure_url,
            tipo: req.file.mimetype,
            nombre: req.file.originalname,
            fechaSubida: new Date()
        });

        await transaction.save();

        res.status(200).json({
            success: true,
            message: 'Archivo subido exitosamente',
            data: {
                url: result.secure_url,
                publicId: result.public_id
            }
        });

    } catch (error) {
        logger.error('Error subiendo archivo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al subir archivo'
        });
    }
};

// @desc    Obtener estadísticas de transacciones
// @route   GET /api/v1/transactions/stats
// @access  Private
exports.getStats = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        const filtros = {};
        if (fechaInicio) filtros.fechaInicio = fechaInicio;
        if (fechaFin) filtros.fechaFin = fechaFin;

        const stats = await Transaction.getEstadisticasUsuario(req.user.id, filtros);

        // Obtener resumen del día actual
        const user = await User.findById(req.user.id);
        const resumenHoy = await user.getResumenHoy();

        res.status(200).json({
            success: true,
            data: {
                ...stats,
                resumenHoy
            }
        });

    } catch (error) {
        logger.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas'
        });
    }
};

// @desc    Obtener transacciones por categoría
// @route   GET /api/v1/transactions/by-category
// @access  Private
exports.getByCategory = async (req, res) => {
    try {
        const { tipo } = req.query;
        const db = require('../config/firebase').db;

        // Fetch query for filtering
        let ref = db.collection('transactions').where('userId', '==', req.user.id);
        if (tipo) ref = ref.where('tipo', '==', tipo);

        const snapshot = await ref.get();
        const transactions = snapshot.docs.map(doc => doc.data());

        // In-memory aggregation
        const categoryMap = new Map();

        transactions.forEach(tx => {
            const cat = tx.categoria || 'Sin Categoría';
            const monto = Number(tx.monto) || 0;

            if (!categoryMap.has(cat)) {
                categoryMap.set(cat, {
                    _id: cat,
                    total: 0,
                    count: 0,
                    min: monto,
                    max: monto
                });
            }

            const stat = categoryMap.get(cat);
            stat.total += monto;
            stat.count += 1;
            stat.min = Math.min(stat.min, monto);
            stat.max = Math.max(stat.max, monto);
        });

        const transactionsByCategory = Array.from(categoryMap.values())
            .map(stat => ({
                ...stat,
                promedio: stat.total / stat.count
            }))
            .sort((a, b) => b.total - a.total); // Sort by total descending

        res.status(200).json({
            success: true,
            count: transactionsByCategory.length,
            data: transactionsByCategory
        });

    } catch (error) {
        logger.error('Error obteniendo transacciones por categoría:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener transacciones por categoría'
        });
    }
};

// @desc    Obtener transacciones por período (diario, semanal, mensual)
// @route   GET /api/v1/transactions/by-period
// @access  Private
exports.getByPeriod = async (req, res) => {
    try {
        const { periodo = 'diario', limite = 30 } = req.query;
        const db = require('../config/firebase').db;

        // Fetch query
        // Note: For large datasets, fetching ALL user transactions might be heavy.
        // Assuming user data fits in memory for this MVP stage or we add a date limit.
        // For performance, we should ideally restrict date range, but here we mimic the original logic.
        const snapshot = await db.collection('transactions')
            .where('userId', '==', req.user.id)
            .get();

        const transactions = snapshot.docs.map(doc => doc.data());

        // Helper to format keys
        const formatDateKey = (date, format) => {
            const d = new Date(date);
            if (isNaN(d)) return 'Invalid Date';
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');

            // Replicating mongo $dateToString formats roughly
            switch (format) {
                case 'diario': return `${year}-${month}-${day}`;
                case 'mensual': return `${year}-${month}`;
                case 'anual': return `${year}`;
                case 'semanal':
                    // Simple week calc (ISO week would be better but keeping it simple)
                    const oneJan = new Date(d.getFullYear(), 0, 1);
                    const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
                    const week = Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
                    return `${year}-${week}`;
                default: return `${year}-${month}-${day}`;
            }
        };

        const groupMap = new Map();

        transactions.forEach(tx => {
            const key = formatDateKey(tx.fecha, periodo);
            const monto = Number(tx.monto) || 0;
            const isIngreso = tx.tipo === 'ingreso';
            const isGasto = tx.tipo === 'gasto';

            if (!groupMap.has(key)) {
                groupMap.set(key, {
                    _id: key,
                    ingresos: 0,
                    gastos: 0,
                    ganancias: 0,
                    count: 0
                });
            }

            const stat = groupMap.get(key);
            stat.count++;

            if (isIngreso) {
                stat.ingresos += monto;
                stat.ganancias += monto;
            } else if (isGasto) {
                stat.gastos += monto;
                stat.ganancias -= monto;
            }
        });

        // Convert Map to Array, sort, limit, and re-sort
        const transactionsByPeriod = Array.from(groupMap.values())
            .sort((a, b) => b._id.localeCompare(a._id)) // Sort desc by date
            .slice(0, parseInt(limite))
            .sort((a, b) => a._id.localeCompare(b._id)); // Re-sort asc

        res.status(200).json({
            success: true,
            data: transactionsByPeriod
        });

    } catch (error) {
        logger.error('Error obteniendo transacciones por período:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener transacciones por período'
        });
    }
};

// @desc    Buscar transacciones
// @route   GET /api/v1/transactions/search
// @access  Private
exports.searchTransactions = async (req, res) => {
    try {
        const { q, campos = 'descripcion' } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Término de búsqueda requerido'
            });
        }

        const searchFields = campos.split(',').map(field => ({
            [field.trim()]: { $regex: q, $options: 'i' }
        }));

        const transactions = await Transaction.find({
            userId: req.user.id,
            $or: searchFields
        })
            .sort({ fecha: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });

    } catch (error) {
        logger.error('Error buscando transacciones:', error);
        res.status(500).json({
            success: false,
            error: 'Error al buscar transacciones'
        });
    }
};

// @desc    Importar transacciones desde archivo
// @route   POST /api/v1/transactions/import
// @access  Private
exports.importTransactions = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Por favor selecciona un archivo'
            });
        }

        // Leer archivo (CSV o Excel)
        const transactions = [];
        let importedCount = 0;
        let errorCount = 0;

        // Lógica para procesar el archivo según su formato
        // Esta es una implementación básica, debería adaptarse al formato específico

        // Ejemplo para CSV:
        const csvData = req.file.buffer.toString();
        const lines = csvData.split('\n');

        for (let i = 1; i < lines.length; i++) { // Saltar encabezado
            const columns = lines[i].split(',');

            if (columns.length >= 4) {
                try {
                    const transaction = await Transaction.create({
                        userId: req.user.id,
                        tipo: columns[0],
                        monto: parseFloat(columns[1]),
                        descripcion: columns[2],
                        categoria: columns[3],
                        fecha: columns[4] ? new Date(columns[4]) : new Date(),
                        creadoPor: 'importacion'
                    });

                    transactions.push(transaction);
                    importedCount++;
                } catch (error) {
                    errorCount++;
                    logger.error(`Error importando línea ${i}:`, error);
                }
            }
        }

        // Actualizar estadísticas del usuario
        const user = await User.findById(req.user.id);
        await user.actualizarEstadisticas();

        res.status(200).json({
            success: true,
            message: `Importación completada. Importadas: ${importedCount}, Errores: ${errorCount}`,
            data: {
                imported: importedCount,
                errors: errorCount,
                transactions: transactions.slice(0, 10) // Devolver solo las primeras 10
            }
        });

    } catch (error) {
        logger.error('Error importando transacciones:', error);
        res.status(500).json({
            success: false,
            error: 'Error al importar transacciones'
        });
    }
};

// @desc    Exportar transacciones a archivo
// @route   GET /api/v1/transactions/export
// @access  Private
exports.exportTransactions = async (req, res) => {
    try {
        const { formato = 'csv', fechaInicio, fechaFin } = req.query;

        const filtros = {};
        if (fechaInicio) filtros.fechaInicio = fechaInicio;
        if (fechaFin) filtros.fechaFin = fechaFin;

        const transactions = await Transaction.find({
            userId: req.user.id,
            ...(fechaInicio && { fecha: { $gte: new Date(fechaInicio) } }),
            ...(fechaFin && { fecha: { $lte: new Date(fechaFin) } })
        }).sort({ fecha: -1 });

        let exportData;

        switch (formato.toLowerCase()) {
            case 'csv':
                exportData = await generateCSV(transactions);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=transacciones.csv');
                break;

            case 'excel':
                exportData = await generateExcel(transactions);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=transacciones.xlsx');
                break;

            case 'json':
                exportData = JSON.stringify(transactions, null, 2);
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=transacciones.json');
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Formato no soportado. Usa: csv, excel o json'
                });
        }

        res.send(exportData);

    } catch (error) {
        logger.error('Error exportando transacciones:', error);
        res.status(500).json({
            success: false,
            error: 'Error al exportar transacciones'
        });
    }
};
