const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    authenticate,
    authorize,
    validate
} = require('../middlewares');
const {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    uploadFile,
    getStats,
    getByCategory,
    getByPeriod,
    searchTransactions,
    importTransactions,
    exportTransactions
} = require('../controllers/transactionController');
const { schemas } = require('../middlewares/validation');

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/transactions/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'), false);
        }
    }
});

const csvUpload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos CSV'), false);
        }
    }
});

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas CRUD básicas
router.route('/')
    .get(validate(schemas.transaction.filter, 'query'), getTransactions)
    .post(validate(schemas.transaction.create), createTransaction);

router.route('/stats')
    .get(getStats);

router.route('/by-category')
    .get(getByCategory);

router.route('/by-period')
    .get(getByPeriod);

router.route('/search')
    .get(searchTransactions);

router.route('/import')
    .post(csvUpload.single('file'), importTransactions);

router.route('/export')
    .get(exportTransactions);

router.route('/:id')
    .get(getTransaction)
    .put(validate(schemas.transaction.update), updateTransaction)
    .delete(deleteTransaction);

router.route('/:id/upload')
    .post(upload.single('file'), uploadFile);

// Rutas específicas para administradores
router.route('/admin/all')
    .get(authorize('admin', 'supervisor'), async (req, res) => {
        // Lógica para administradores
    });

module.exports = router;
