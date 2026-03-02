const express = require('express');
const aiController = require('../controllers/aiController');

const router = express.Router();

router.post('/hint', aiController.hint);
router.post('/intuition', aiController.intuition);

module.exports = router;


