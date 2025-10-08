const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/auth');
const { roleCheck, ownershipCheck, readOnlyCheck } = require('../middleware/roleCheck');
const { transactionValidation } = require('../middleware/validation');
const { transactionLimiter } = require('../middleware/rateLimiter');
const { validateAndSanitize, validateTransaction } = require('../middleware/security');

// Apply middleware to all routes
router.use(authMiddleware);
router.use(transactionLimiter);
router.use(validateAndSanitize);
router.use(ownershipCheck); // Ensure users can only access their own data

// GET routes - accessible to all authenticated users (admin, user, read-only)
router.get('/', transactionController.getTransactions);
router.get('/categories', transactionController.getCategories);
router.get('/:id', transactionController.getTransaction);

// POST/PUT/DELETE routes - only admin and user roles, not read-only
router.post('/', 
    readOnlyCheck, // Prevent read-only users from creating
    roleCheck('admin', 'user'), 
    validateTransaction,
    transactionValidation, 
    transactionController.createTransaction
);

router.put('/:id', 
    readOnlyCheck, // Prevent read-only users from updating
    roleCheck('admin', 'user'), 
    validateTransaction,
    transactionValidation, 
    transactionController.updateTransaction
);

router.delete('/:id', 
    readOnlyCheck, // Prevent read-only users from deleting
    roleCheck('admin', 'user'), 
    transactionController.deleteTransaction
);

module.exports = router;