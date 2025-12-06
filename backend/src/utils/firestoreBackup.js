const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { db } = require('../config/firebase');
const fs = require('fs');
const logger = require('./logger');

const collections = ['users', 'shifts', 'transactions', 'vehicles'];

const backupFirestore = async () => {
    try {
        logger.info('📦 Iniciando respaldo de base de datos Firestore...');

        const backupData = {};
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.json`;
        const backupPath = path.join(__dirname, '../../backups', filename);

        // Asegurar que exista el directorio
        const backupDir = path.dirname(backupPath);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        for (const collectionName of collections) {
            logger.info(`   - Descargando colección: ${collectionName}...`);
            const snapshot = await db.collection(collectionName).get();

            if (snapshot.empty) {
                backupData[collectionName] = [];
                continue;
            }

            backupData[collectionName] = snapshot.docs.map(doc => ({
                _id: doc.id,
                ...doc.data()
            }));
        }

        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

        logger.info(`✅ Respaldo completado exitosamente.`);
        logger.info(`📂 Archivo guardado en: ${backupPath}`);

        // Mantener solo los últimos 5 backups para ahorrar espacio
        cleanupOldBackups(backupDir);

        process.exit(0);
    } catch (error) {
        logger.error('❌ Error fatal durante el respaldo:', error);
        process.exit(1);
    }
};

const cleanupOldBackups = (dir) => {
    try {
        const files = fs.readdirSync(dir)
            .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
            .map(f => ({ name: f, time: fs.statSync(path.join(dir, f)).mtime.getTime() }))
            .sort((a, b) => b.time - a.time);

        if (files.length > 5) {
            const toDelete = files.slice(5);
            toDelete.forEach(file => {
                fs.unlinkSync(path.join(dir, file.name));
                logger.info(`🗑️ Respaldo antiguo eliminado: ${file.name}`);
            });
        }
    } catch (err) {
        logger.warn('⚠️ No se pudieron limpiar respaldos antiguos:', err.message);
    }
}

if (require.main === module) {
    backupFirestore();
}

module.exports = backupFirestore;
