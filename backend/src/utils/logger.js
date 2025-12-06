const winston = require('winston');
const path = require('path');
const moment = require('moment');

// Definir niveles de log personalizados
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Definir colores para cada nivel
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

winston.addColors(colors);

// Formato personalizado
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Formato para consola
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../logs');

// Configurar transports
const transports = [
    // Consola (solo en desarrollo)
    new winston.transports.Console({
        format: consoleFormat,
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
    }),

    // Archivo de errores
    new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        format: format,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),

    // Archivo de todos los logs
    new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        format: format,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),

    // Archivo de logs HTTP
    new winston.transports.File({
        filename: path.join(logsDir, 'http.log'),
        level: 'http',
        format: format,
        maxsize: 5242880,
        maxFiles: 5,
    }),
];

// Crear logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format,
    transports,
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'exceptions.log'),
            format: format,
        }),
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'rejections.log'),
            format: format,
        }),
    ],
});

// Stream para morgan (HTTP logging)
logger.stream = {
    write: (message) => logger.http(message.trim()),
};

// Métodos auxiliares
logger.request = (req) => {
    const logData = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user ? req.user.id : 'guest',
    };

    logger.info('Request', logData);
};

logger.response = (res, data) => {
    const logData = {
        statusCode: res.statusCode,
        responseTime: res.get('X-Response-Time'),
        userId: res.req.user ? res.req.user.id : 'guest',
    };

    logger.info('Response', logData);
};

logger.errorWithContext = (error, context = {}) => {
    logger.error({
        message: error.message,
        stack: error.stack,
        ...context
    });
};

// Logger para transacciones
logger.transaction = (action, transaction, userId) => {
    logger.info('Transaction', {
        action,
        transactionId: transaction._id,
        tipo: transaction.tipo,
        monto: transaction.monto,
        categoria: transaction.categoria,
        userId
    });
};

// Logger para usuarios
logger.user = (action, user, ip) => {
    logger.info('User', {
        action,
        userId: user._id,
        email: user.email,
        ip
    });
};

module.exports = logger;
