const express = require('express');
const diagramController = require('../controllers/diagramController');

const router = express.Router();

// Simple health for router debugging
router.get('/', (req, res) => {
  res.json({ ok: true, route: 'diagram' });
});

router.post('/mermaid', diagramController.generateMermaid);

module.exports = router;


