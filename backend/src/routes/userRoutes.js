const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    getProfile,
    updateProfile,
    updateConfig,
    uploadAvatar,
    deleteAccount
} = require('../controllers/userController');
const { authenticate, validate } = require('../middlewares');

// Configurar multer para avatar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/avatars/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
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

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/config', updateConfig);
router.post('/avatar', upload.single('file'), uploadAvatar);
router.delete('/account', deleteAccount);

module.exports = router;
