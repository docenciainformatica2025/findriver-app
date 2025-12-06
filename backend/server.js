require('dotenv').config();
// Force Restart Triggered

const app = require('./src/app');
const { createServer } = require('http');
const { Server } = require('socket.io');
const logger = require('./src/utils/logger');
// const connectDB = require('./src/config/database'); // Deprecated for Firestore

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Crear servidor HTTP
const httpServer = createServer(app);

// Configurar Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    }
});

// Manejar conexiones Socket.io
require('./src/sockets')(io);

// Iniciar servidor (Sin esperar a Mongo)
httpServer.listen(PORT, () => {
    logger.info(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    logger.info(`🌍 Entorno: ${NODE_ENV}`);
    logger.info(`📡 URL: http://localhost:${PORT}`);
    logger.info(`📊 Dashboard: http://localhost:${PORT}/api-docs`);
    logger.info(`🔥 Firestore: Conectado (Lazy Loading)`);
});

// Manejar cierre elegante
process.on('SIGTERM', () => {
    logger.info('SIGTERM recibido. Cerrando servidor...');
    httpServer.close(() => {
        logger.info('Servidor cerrado');
        process.exit(0);
    });
});
