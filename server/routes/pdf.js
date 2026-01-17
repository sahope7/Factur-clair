const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

const router = express.Router();

router.use(authenticateToken);

// Générer le PDF d'une facture
router.get('/facture/:id', (req, res) => {
  const { id } = req.params;
  generateInvoicePDF(id, res);
});

module.exports = router;
