const User = require('../models/User');
const logger = require('../utils/logger');
const cloudinary = require('../config/cloudinary');

// @desc    Obtener perfil de usuario
// @route   GET /api/v1/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        logger.error('Error obteniendo perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener perfil'
        });
    }
};

// @desc    Actualizar perfil de usuario
// @route   PUT /api/v1/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const {
            nombre,
            telefono,
            direccion,
            dni,
            licenciaConducir,
            fechaNacimiento,
            configuracion,
            // Campos de vehículo y costos agregados
            tipoVehiculo,
            marca,
            modelo,
            placa,
            costosFijos
        } = req.body;

        // Construir objeto de actualización
        const updateFields = {};
        if (nombre) updateFields.nombre = nombre;
        if (telefono) updateFields.telefono = telefono;
        if (direccion) updateFields.direccion = direccion;
        if (dni) updateFields.dni = dni;
        if (licenciaConducir) updateFields.licenciaConducir = licenciaConducir;
        if (fechaNacimiento) updateFields.fechaNacimiento = fechaNacimiento;

        // Campos faltantes agregados
        if (tipoVehiculo) updateFields.tipoVehiculo = tipoVehiculo;
        if (marca) updateFields.marca = marca;
        if (modelo) updateFields.modelo = modelo;
        if (placa) updateFields.placa = placa;
        if (costosFijos) updateFields.costosFijos = costosFijos;

        // Manejo seguro de configuración (Dot Notation para Firestore)
        if (configuracion) {
            Object.keys(configuracion).forEach(key => {
                updateFields[`configuracion.${key}`] = configuracion[key];
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateFields, // No usar $set aquí porque User.js ya lo maneja o Firestore lo hace directo
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: user
        });
    } catch (error) {
        logger.error('Error actualizando perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar perfil'
        });
    }
};

// @desc    Actualizar configuración de usuario
// @route   PUT /api/v1/users/config
// @access  Private
exports.updateConfig = async (req, res) => {
    try {
        console.log('UpdateConfig Request Body:', JSON.stringify(req.body, null, 2));
        console.log('User ID:', req.user.id);
        const { moneda, tema, idioma, notificaciones, recordatorios, configuracion, precioCombustible } = req.body;

        const user = await User.findById(req.user.id);

        // Si se envía un objeto configuración completo, fusionarlo
        if (configuracion) {
            user.configuracion = { ...user.configuracion, ...configuracion };
        }

        // Actualizaciones de campos individuales (para compatibilidad o actualizaciones parciales)
        if (moneda) user.configuracion.moneda = moneda;
        if (tema) user.configuracion.tema = tema;
        if (idioma) user.configuracion.idioma = idioma;
        if (precioCombustible !== undefined) user.configuracion.precioCombustible = Number(precioCombustible);

        if (notificaciones !== undefined) {
            user.configuracion.notificaciones = notificaciones;
            user.configuracion.notificacionesEmail = notificaciones;
            user.configuracion.notificacionesPush = notificaciones;
        }
        if (recordatorios !== undefined) user.configuracion.recordatorios = recordatorios;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Configuración actualizada exitosamente',
            data: user.configuracion
        });
    } catch (error) {
        logger.error('Error actualizando configuración:', error);
        res.status(500).json({
            success: false,
            error: `Error al actualizar configuración: ${error.message}`
        });
    }
};

// @desc    Subir foto de perfil
// @route   POST /api/v1/users/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Por favor selecciona una imagen'
            });
        }

        // Subir a Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: `finanzas-conductor/avatars/${req.user.id}`,
            width: 500,
            height: 500,
            crop: 'fill',
            gravity: 'face'
        });

        // Actualizar usuario
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { fotoPerfil: result.secure_url },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Foto de perfil actualizada',
            data: {
                fotoPerfil: user.fotoPerfil
            }
        });
    } catch (error) {
        logger.error('Error subiendo avatar:', error);
        res.status(500).json({
            success: false,
            error: 'Error al subir imagen'
        });
    }
};

// @desc    Eliminar cuenta (desactivar)
// @route   DELETE /api/v1/users/account
// @access  Private
exports.deleteAccount = async (req, res) => {
    try {
        // Soft delete (desactivar)
        await User.findByIdAndUpdate(req.user.id, { activo: false });

        res.status(200).json({
            success: true,
            message: 'Cuenta desactivada exitosamente'
        });
    } catch (error) {
        logger.error('Error eliminando cuenta:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar cuenta'
        });
    }
};
