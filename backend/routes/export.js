const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const authMiddleware = require('../middleware/auth');
const auditMiddleware = require('../middleware/auditMiddleware');

router.use(authMiddleware);

router.get('/transactions', 
    auditMiddleware('export', 'transactions'),
    exportController.exportTransactions
);

router.get('/analytics', 
    auditMiddleware('export', 'analytics'),
    exportController.exportAnalytics
);

module.exports = router;