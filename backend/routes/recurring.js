const express = require('express');
const router = express.Router();
const recurringController = require('../controllers/recurringController');
const authMiddleware = require('../middleware/auth');
const { roleCheck, ownershipCheck, readOnlyCheck } = require('../middleware/roleCheck');
const { validateAndSanitize } = require('../middleware/security');

router.use(authMiddleware);
router.use(validateAndSanitize);
router.use(ownershipCheck);

// GET routes - accessible to all roles
router.get('/', recurringController.getRecurringTransactions);

// POST/PUT/DELETE routes - only admin and user roles
router.post('/', 
    readOnlyCheck,
    roleCheck('admin', 'user'),
    recurringController.createRecurringTransaction
);

router.put('/:id', 
    readOnlyCheck,
    roleCheck('admin', 'user'),
    recurringController.updateRecurringTransaction
);

router.delete('/:id', 
    readOnlyCheck,
    roleCheck('admin', 'user'),
    recurringController.deleteRecurringTransaction
);

// Admin only - process due transactions
router.post('/process', 
    roleCheck('admin'),
    recurringController.processDueTransactions
);

module.exports = router;