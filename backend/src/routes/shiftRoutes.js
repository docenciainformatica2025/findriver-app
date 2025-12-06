const express = require('express');
const router = express.Router();
const { startShift, endShift, getCurrentShift } = require('../controllers/shiftController');
const { authenticate } = require('../middlewares');

router.use(authenticate);

router.post('/start', startShift);
router.post('/end', endShift);
router.get('/current', getCurrentShift);

module.exports = router;
