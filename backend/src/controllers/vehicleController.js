const Vehicle = require('../models/Vehicle');
const logger = require('../utils/logger');
const cloudinary = require('../config/cloudinary');

// @desc    Obtener todos los vehículos del usuario
// @route   GET /api/v1/vehicles
// @access  Private
exports.getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ userId: req.user.id })
            .sort({ principal: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        logger.error('Error obteniendo vehículos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener vehículos'
        });
    }
};

// @desc    Obtener vehículo por ID
// @route   GET /api/v1/vehicles/:id
// @access  Private
exports.getVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: 'Vehículo no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        logger.error('Error obteniendo vehículo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener vehículo'
        });
    }
};

// @desc    Crear nuevo vehículo
// @route   POST /api/v1/vehicles
// @access  Private
exports.createVehicle = async (req, res) => {
    try {
        req.body.userId = req.user.id;

        // Si es el primer vehículo, hacerlo principal automáticamente
        const count = await Vehicle.countDocuments({ userId: req.user.id });
        if (count === 0) {
            req.body.principal = true;
        }

        // Si se marca como principal, desmarcar otros
        if (req.body.principal) {
            await Vehicle.updateMany(
                { userId: req.user.id },
                { principal: false }
            );
        }

        const vehicle = await Vehicle.create(req.body);

        // Actualizar usuario con referencia al vehículo
        req.user.vehiculos.push(vehicle._id);
        await req.user.save();

        res.status(201).json({
            success: true,
            message: 'Vehículo registrado exitosamente',
            data: vehicle
        });
    } catch (error) {
        logger.error('Error creando vehículo:', error);

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
            error: error.message || 'Error al registrar vehículo',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Actualizar vehículo
// @route   PUT /api/v1/vehicles/:id
// @access  Private
exports.updateVehicle = async (req, res) => {
    try {
        let vehicle = await Vehicle.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: 'Vehículo no encontrado'
            });
        }

        // Si se marca como principal, desmarcar otros
        if (req.body.principal) {
            await Vehicle.updateMany(
                { userId: req.user.id, _id: { $ne: req.params.id } },
                { principal: false }
            );
        }

        vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Vehículo actualizado exitosamente',
            data: vehicle
        });
    } catch (error) {
        logger.error('Error actualizando vehículo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar vehículo'
        });
    }
};

// @desc    Eliminar vehículo
// @route   DELETE /api/v1/vehicles/:id
// @access  Private
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: 'Vehículo no encontrado'
            });
        }

        // Eliminar foto si existe en Cloudinary
        if (vehicle.foto && vehicle.foto.includes('cloudinary')) {
            const publicId = vehicle.foto.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await vehicle.deleteOne();

        // Eliminar referencia del usuario
        req.user.vehiculos = req.user.vehiculos.filter(
            v => v.toString() !== req.params.id
        );
        await req.user.save();

        res.status(200).json({
            success: true,
            message: 'Vehículo eliminado exitosamente'
        });
    } catch (error) {
        logger.error('Error eliminando vehículo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar vehículo'
        });
    }
};

// @desc    Obtener estado de salud y alertas del vehículo principal
// @route   GET /api/v1/vehicles/health
// @access  Private
exports.getVehicleHealth = async (req, res) => {
    try {
        // Buscar vehículo principal, o el más reciente si no hay principal
        let vehicle = await Vehicle.findOne({ userId: req.user.id, principal: true });

        if (!vehicle) {
            vehicle = await Vehicle.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
        }

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: 'No hay vehículos registrados'
            });
        }

        // Obtener alertas usando el método del modelo
        const alerts = vehicle.getAlertas();

        res.status(200).json({
            success: true,
            data: {
                vehicleId: vehicle._id,
                vehicleName: `${vehicle.marca} ${vehicle.modelo}`,
                alertas: alerts,
                kilometraje: vehicle.estadisticas.kilometrajeActual,
                proximoServicio: vehicle.mantenimiento.proximoServicio,
                kmProximoServicio: vehicle.mantenimiento.kilometrajeProximoServicio
            }
        });
    } catch (error) {
        logger.error('Error obteniendo salud del vehículo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener reporte de salud'
        });
    }
};

// @desc    Subir foto del vehículo
// @route   POST /api/v1/vehicles/:id/photo
// @access  Private
exports.uploadPhoto = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: 'Vehículo no encontrado'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Por favor selecciona una imagen'
            });
        }

        // Subir a Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: `finanzas-conductor/vehicles/${req.user.id}`,
            width: 800,
            height: 600,
            crop: 'limit'
        });

        vehicle.foto = result.secure_url;
        await vehicle.save();

        res.status(200).json({
            success: true,
            message: 'Foto subida exitosamente',
            data: {
                foto: vehicle.foto
            }
        });
    } catch (error) {
        logger.error('Error subiendo foto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al subir foto'
        });
    }
};
