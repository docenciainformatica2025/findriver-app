const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    getVehicles,
    getVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    uploadPhoto,
    getVehicleHealth
} = require('../controllers/vehicleController');
const { authenticate, validate } = require('../middlewares');
const { schemas } = require('../middlewares/validation');

// Configurar multer para fotos de vehículos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/vehicles/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'vehicle-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (jpg, jpeg, png)'), false);
        }
    }
});

router.use(authenticate);

router.route('/')
    .get(getVehicles)
    .post(validate(schemas.vehicle.create), createVehicle);

router.get('/health', getVehicleHealth);

router.route('/:id')
    .get(getVehicle)
    .put(validate(schemas.vehicle.update), updateVehicle)
    .delete(deleteVehicle);

router.route('/:id/photo')
    .post(upload.single('file'), uploadPhoto);

module.exports = router;
