const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Dashboard routes placeholder' });
});

module.exports = router;
