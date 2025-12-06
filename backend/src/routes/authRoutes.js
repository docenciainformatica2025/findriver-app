const express = require('express');
const router = express.Router();
const {
    register,
    registerFirebase,
    login,
    logout,
    refreshToken,
    verifyEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    verifyToken
} = require('../controllers/authController');
const { authenticate, validate } = require('../middlewares');
const { schemas } = require('../middlewares/validation');

// Rutas públicas
router.post('/register-firebase', registerFirebase);
router.post('/register', validate(schemas.auth.register), register);
router.post('/login', validate(schemas.auth.login), login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', validate(schemas.auth.forgotPassword), forgotPassword);
router.put('/reset-password/:token', validate(schemas.auth.resetPassword), resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Rutas protegidas
router.use(authenticate);
router.post('/logout', logout);
router.put('/change-password', changePassword);
router.get('/verify-token', verifyToken);

module.exports = router;
