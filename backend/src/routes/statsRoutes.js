const express = require('express');
const router = express.Router();
const { getCPKStats } = require('../controllers/statsController');
const { authenticate } = require('../middlewares');

router.use(authenticate);

router.get('/cpk', getCPKStats);

module.exports = router;
