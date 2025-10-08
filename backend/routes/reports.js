const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const authMiddleware = require('../middleware/auth');
const { ownershipCheck } = require('../middleware/roleCheck');
const { validateAndSanitize } = require('../middleware/security');

router.use(authMiddleware);
router.use(validateAndSanitize);
router.use(ownershipCheck);

// All report routes accessible to all authenticated users
router.get('/financial', reportsController.getFinancialReport);
router.get('/tax', reportsController.getTaxReport);
router.get('/budget', reportsController.getBudgetReport);

module.exports = router;