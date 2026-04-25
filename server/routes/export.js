const express = require('express');
const router = express.Router();
const { exportSinglePdf, exportDashboardPdf } = require('../controllers/exportController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/pdf/:id', authenticateToken, exportSinglePdf);
router.get('/dashboard/pdf', authenticateToken, requireAdmin, exportDashboardPdf);

module.exports = router;
