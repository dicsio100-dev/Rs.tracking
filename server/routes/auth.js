const express = require('express');
const router = express.Router();
const { login, getMe, changePassword, forgotPassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', authenticateToken, getMe);
router.put('/password', authenticateToken, changePassword);

module.exports = router;
