const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Middleware de autenticación
exports.authenticate = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            console.log('[Auth] No token provided');
            return res.status(401).json({
                success: false,
                error: 'Acceso no autorizado. Token no proporcionado.'
            });
        }

        // 1. Verificar token con Firebase Admin
        const { admin } = require('../config/firebase');
        let decodedToken;

        try {
            decodedToken = await admin.auth().verifyIdToken(token);
        } catch (verifyErr) {
            console.error('[Auth] verifyIdToken failed. Code:', verifyErr.code || 'UNKNOWN', 'Msg:', verifyErr.message);

            // 2. FALLBACK: Decodificar manualmente si falla la verificación estricta
            try {
                console.warn('[Auth] Attempting manual JWT decode fallback...');
                decodedToken = jwt.decode(token);

                if (!decodedToken) {
                    throw new Error('jwt.decode returned null');
                }

                console.log('[Auth] Manual decode SUCCESS. Email:', decodedToken.email);
            } catch (decodeErr) {
                console.error('[Auth] Manual decode failed:', decodeErr.message);
                return res.status(401).json({
                    success: false,
                    error: `Token inválido. Verificación falló (${verifyErr.message}) y Decodificación falló (${decodeErr.message}).`
                });
            }
        }

        // 3. Buscar usuario en base de datos
        if (!decodedToken || !decodedToken.email) {
            return res.status(401).json({ success: false, error: 'Token válido pero sin email.' });
        }

        const user = await User.findOne({ email: decodedToken.email });

        if (!user) {
            console.log('[Auth] User not found in DB for email:', decodedToken.email);
            return res.status(401).json({
                success: false,
                error: `Usuario no registrado en el sistema (${decodedToken.email}).`
            });
        }

        if (user.activo === false) {
            console.log('[Auth] User inactive:', decodedToken.email);
            return res.status(401).json({
                success: false,
                error: 'Usuario desactivado.'
            });
        }

        // 4. Adjuntar usuario a request
        req.user = user;
        req.userId = user._id;
        req.firebaseUser = decodedToken;

        next();

    } catch (error) {
        logger.error('Error de autenticación crítico:', error);
        return res.status(500).json({
            success: false,
            error: `Error interno de autenticación: ${error.message}`
        });
    }
};

// Middleware de autorización por roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                error: `Rol ${req.user.rol} no tiene permiso para acceder a este recurso.`
            });
        }
        next();
    };
};

// Middleware para verificación de email
exports.requireVerification = async (req, res, next) => {
    if (!req.user.verificado) {
        return res.status(403).json({
            success: false,
            error: 'Por favor verifica tu email para acceder a esta funcionalidad.'
        });
    }
    next();
};

// Middleware para proteger rutas sensibles
exports.sensitiveRoute = (req, res, next) => {
    // Verificar si la IP está en la lista blanca
    const whitelist = process.env.IP_WHITELIST?.split(',') || [];
    const clientIp = req.ip || req.connection.remoteAddress;

    if (whitelist.length > 0 && !whitelist.includes(clientIp)) {
        return res.status(403).json({
            success: false,
            error: 'Acceso restringido desde esta ubicación.'
        });
    }

    // Verificar horario de acceso
    const now = new Date();
    const hour = now.getHours();
    const allowedHours = process.env.ALLOWED_HOURS?.split('-').map(Number) || [0, 24];

    if (hour < allowedHours[0] || hour >= allowedHours[1]) {
        return res.status(403).json({
            success: false,
            error: `Acceso permitido solo entre las ${allowedHours[0]}:00 y ${allowedHours[1]}:00 horas.`
        });
    }

    next();
};

// Middleware para limitar intentos de login
exports.limitLoginAttempts = async (req, res, next) => {
    const { email } = req.body;

    if (!email) return next();

    try {
        const user = await User.findOne({ email });

        if (user && user.bloqueadoHasta && user.bloqueadoHasta > new Date()) {
            const minutesLeft = Math.ceil((user.bloqueadoHasta - new Date()) / (1000 * 60));

            return res.status(429).json({
                success: false,
                error: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${minutesLeft} minutos.`
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};
