const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const logger = require('./utils/logger');
const mongoose = require('mongoose'); // Added missing import
const cookieParser = require('cookie-parser');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const statsRoutes = require('./routes/statsRoutes');
const shiftRoutes = require('./routes/shiftRoutes');

// Importar middlewares
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

// Middlewares de seguridad
// app.use(helmet({ ... })); // DISABLED FOR DEBUGGING

const app = express();

// Global Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

// Configurar CORS
app.use(cors({
    origin: true, // Allow ALL origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
// const limiter = rateLimit({ ... }); // DISABLED FOR DEBUGGING
// app.use('/api', limiter);

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } })); // Adapted for Winston stream

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Sanitización
app.use(mongoSanitize());
app.use(xss());

// Compresión
app.use(compression());

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Documentación API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Rutas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/shifts', shiftRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', reportRoutes);

// Rutas de diagnóstico
app.use('/api/v1/debug', require('./routes/debugRoutes'));

// Ruta base
app.get('/', (req, res) => {
    res.send('API FinDriver Pro funcionando 🚀 v1.2.0');
});

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({
        message: '🚗 API Finanzas del Conductor',
        version: '1.0.0',
        documentation: '/api-docs',
        endpoints: {
            auth: '/api/v1/auth',
            users: '/api/v1/users',
            transactions: '/api/v1/transactions',
            vehicles: '/api/v1/vehicles',
            reports: '/api/v1/reports',
            dashboard: '/api/v1/dashboard'
        }
    });
});

// Manejo de rutas no encontradas
app.use(notFound);

// Manejo de errores global
app.use(errorHandler);

module.exports = app;
