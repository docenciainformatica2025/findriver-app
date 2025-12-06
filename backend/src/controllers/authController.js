const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const { sendEmail } = require('../services/emailService');
const logger = require('../utils/logger');

// @desc    Registrar usuario con Firebase
// @route   POST /api/v1/auth/register-firebase
// @access  Public
exports.registerFirebase = async (req, res) => {
    try {
        const { token, nombre, email, rol } = req.body;

        // Verificar token de Firebase
        const { admin } = require('../config/firebase');
        const decodedToken = await admin.auth().verifyIdToken(token);

        if (decodedToken.email !== email) {
            return res.status(400).json({
                success: false,
                error: 'Email del token no coincide'
            });
        }

        // Verificar si existe
        let user = await User.findOne({ email });

        if (user) {
            return res.status(200).json({
                success: true,
                message: 'Usuario ya existe',
                data: user
            });
        }

        // Crear usuario sin password (manejado por Firebase)
        user = await User.create({
            nombre: nombre || email.split('@')[0],
            email,
            password: crypto.randomBytes(16).toString('hex'), // Dummy password
            rol: rol || 'conductor', // Default rol
            verificado: decodedToken.email_verified || false,
            activo: true
        });

        res.status(201).json({
            success: true,
            data: user
        });

    } catch (error) {
        logger.error('Error registro firebase:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Registrar usuario
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { nombre, email, password, telefono, tipoVehiculo } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'El email ya está registrado'
            });
        }

        // Crear usuario
        const user = await User.create({
            nombre,
            email,
            password,
            telefono,
            tipoVehiculo,
            codigoVerificacion: crypto.randomBytes(20).toString('hex')
        });

        // Generar token
        const token = user.generateAuthToken();
        const refreshToken = user.generateRefreshToken();

        // Guardar refresh token
        user.refreshToken = refreshToken;
        await user.save();

        // Enviar email de verificación
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${user.codigoVerificacion}`;

        await sendEmail({
            to: user.email,
            subject: 'Verifica tu cuenta - Finanzas Conductor',
            template: 'verification',
            context: {
                nombre: user.nombre,
                verificationUrl
            }
        });

        // Enviar respuesta
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente. Por favor verifica tu email.',
            data: {
                user: {
                    id: user._id,
                    nombre: user.nombre,
                    email: user.email,
                    rol: user.rol
                },
                token,
                refreshToken
            }
        });

    } catch (error) {
        logger.error('Error en registro:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'El email ya está registrado'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Error al registrar usuario',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Iniciar sesión
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar email y password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporciona email y contraseña'
            });
        }

        // Buscar usuario incluyendo password
        const user = await User.findOne({ email }).select('+password +intentosFallidos +bloqueadoHasta');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        // Verificar si la cuenta está bloqueada
        if (user.bloqueadoHasta && user.bloqueadoHasta > new Date()) {
            const minutesLeft = Math.ceil((user.bloqueadoHasta - new Date()) / (1000 * 60));

            return res.status(429).json({
                success: false,
                error: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${minutesLeft} minutos.`
            });
        }

        // Verificar contraseña
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            // Incrementar intentos fallidos
            user.intentosFallidos += 1;

            // Bloquear cuenta después de 5 intentos fallidos
            if (user.intentosFallidos >= 5) {
                user.bloqueadoHasta = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
            }

            await user.save();

            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas',
                intentosRestantes: 5 - user.intentosFallidos
            });
        }

        // Resetear intentos fallidos
        user.intentosFallidos = 0;
        user.bloqueadoHasta = null;
        user.ultimoAcceso = new Date();

        // Generar tokens
        const token = user.generateAuthToken();
        const refreshToken = user.generateRefreshToken();

        // Guardar refresh token
        user.refreshToken = refreshToken;
        await user.save();

        // Crear cookie options
        const cookieOptions = {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        };

        // Obtener vehículos
        const vehicles = await Vehicle.find({ userId: user._id });

        // Enviar respuesta
        res
            .cookie('refreshToken', refreshToken, cookieOptions)
            .status(200)
            .json({
                success: true,
                message: 'Inicio de sesión exitoso',
                data: {
                    user: {
                        id: user._id,
                        nombre: user.nombre,
                        email: user.email,
                        rol: user.rol,
                        verificado: user.verificado,
                        configuracion: user.configuracion,
                        estadisticas: user.estadisticas,
                        vehiculos: vehicles
                    },
                    token,
                    refreshToken
                }
            });

    } catch (error) {
        logger.error('Error en login:', error);
        res.status(500).json({
            success: false,
            error: 'Error al iniciar sesión'
        });
    }
};

// @desc    Cerrar sesión
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    try {
        // Eliminar refresh token de la base de datos
        await User.findByIdAndUpdate(req.user.id, {
            $set: { refreshToken: null }
        });

        // Limpiar cookies
        res.clearCookie('refreshToken');

        res.status(200).json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });

    } catch (error) {
        logger.error('Error en logout:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cerrar sesión'
        });
    }
};

// @desc    Refrescar token
// @route   POST /api/v1/auth/refresh-token
// @access  Public (con refresh token)
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token requerido'
            });
        }

        // Verificar refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Buscar usuario con el refresh token
        const user = await User.findOne({
            _id: decoded.userId,
            refreshToken
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Refresh token inválido'
            });
        }

        // Generar nuevo access token
        const newAccessToken = user.generateAuthToken();

        // Opcional: generar nuevo refresh token
        const newRefreshToken = user.generateRefreshToken();
        user.refreshToken = newRefreshToken;
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                token: newAccessToken,
                refreshToken: newRefreshToken
            }
        });

    } catch (error) {
        logger.error('Error refrescando token:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Refresh token inválido'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Error al refrescar token'
        });
    }
};

// @desc    Verificar email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            codigoVerificacion: token,
            verificado: false
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Token de verificación inválido o expirado'
            });
        }

        // Actualizar usuario
        user.verificado = true;
        user.codigoVerificacion = undefined;
        user.fechaVerificacion = new Date();
        await user.save();

        // Redirigir al frontend
        res.redirect(`${process.env.FRONTEND_URL}/email-verificado`);

    } catch (error) {
        logger.error('Error verificando email:', error);
        res.status(500).json({
            success: false,
            error: 'Error al verificar email'
        });
    }
};

// @desc    Olvidé contraseña
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'No existe un usuario con ese email'
            });
        }

        // Generar token de reset
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token y guardar en la base de datos
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutos
        await user.save();

        // Crear URL de reset
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // Enviar email
        await sendEmail({
            to: user.email,
            subject: 'Restablecer contraseña - Finanzas Conductor',
            template: 'resetPassword',
            context: {
                nombre: user.nombre,
                resetUrl
            }
        });

        res.status(200).json({
            success: true,
            message: 'Email de restablecimiento de contraseña enviado'
        });

    } catch (error) {
        logger.error('Error en forgot password:', error);
        res.status(500).json({
            success: false,
            error: 'Error al procesar la solicitud'
        });
    }
};

// @desc    Resetear contraseña
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hash el token recibido
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Buscar usuario con token válido
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Token inválido o expirado'
            });
        }

        // Actualizar contraseña
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.intentosFallidos = 0;
        user.bloqueadoHasta = null;

        await user.save();

        // Enviar email de confirmación
        await sendEmail({
            to: user.email,
            subject: 'Contraseña actualizada - Finanzas Conductor',
            template: 'passwordUpdated',
            context: {
                nombre: user.nombre,
                fecha: new Date().toLocaleDateString()
            }
        });

        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        logger.error('Error en reset password:', error);
        res.status(500).json({
            success: false,
            error: 'Error al restablecer contraseña'
        });
    }
};

// @desc    Cambiar contraseña (usuario logueado)
// @route   PUT /api/v1/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Buscar usuario con password
        const user = await User.findById(req.user.id).select('+password');

        // Verificar contraseña actual
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Contraseña actual incorrecta'
            });
        }

        // Actualizar contraseña
        user.password = newPassword;
        await user.save();

        // Enviar email de notificación
        await sendEmail({
            to: user.email,
            subject: 'Contraseña cambiada - Finanzas Conductor',
            template: 'passwordChanged',
            context: {
                nombre: user.nombre,
                fecha: new Date().toLocaleDateString(),
                ip: req.ip
            }
        });

        res.status(200).json({
            success: true,
            message: 'Contraseña cambiada exitosamente'
        });

    } catch (error) {
        logger.error('Error cambiando contraseña:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cambiar contraseña'
        });
    }
};

// @desc    Verificar token
// @route   GET /api/v1/auth/verify-token
// @access  Private
exports.verifyToken = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const vehicles = await Vehicle.find({ userId: req.user.id });

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    nombre: user.nombre,
                    email: user.email,
                    rol: user.rol,
                    verificado: user.verificado,
                    configuracion: user.configuracion,
                    estadisticas: user.estadisticas,
                    vehiculos: vehicles
                }
            }
        });
    } catch (error) {
        logger.error('Error verificando token:', error);
        res.status(500).json({
            success: false,
            error: 'Error al verificar token'
        });
    }
};
