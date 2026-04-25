const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  getReports, getReportById, createReport, updateReport,
  submitReport, unlockReport, uploadAttachments, deleteAttachment, getStats
} = require('../controllers/reportController');

router.use(authenticateToken);

// Stats (admin)
router.get('/stats', requireAdmin, getStats);

// CRUD
router.get('/', getReports);
router.get('/:id', getReportById);
router.post('/', createReport);
router.put('/:id', updateReport);

// Submit / Lock
router.post('/:id/submit', submitReport);
router.post('/:id/unlock', requireAdmin, unlockReport);

// Attachments
router.post('/:id/attachments', upload.array('files', 5), uploadAttachments);
router.delete('/:id/attachments/:attachmentId', deleteAttachment);

module.exports = router;
