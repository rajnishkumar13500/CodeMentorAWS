const express = require('express');
const healthController = require('../controllers/healthController');
const compilerController = require('../controllers/compilerController');
const aiRoutes = require('./ai');
const diagramRoutes = require('./diagram');

const router = express.Router();

router.get('/', healthController.getHealth);
router.post('/compile', compilerController.compile);
router.use('/ai', aiRoutes);
router.use('/diagram', diagramRoutes);

module.exports = router;
