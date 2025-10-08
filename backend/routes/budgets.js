const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authMiddleware = require('../middleware/auth');
const { roleCheck, ownershipCheck, readOnlyCheck } = require('../middleware/roleCheck');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { validateAndSanitize } = require('../middleware/security');

const budgetValidation = [
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('period').isIn(['monthly', 'yearly']).withMessage('Invalid period'),
    body('start_date').isISO8601().withMessage('Invalid start date'),
    body('end_date').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid end date'),
    validate
];

router.use(authMiddleware);
router.use(validateAndSanitize);
router.use(ownershipCheck);

router.get('/', budgetController.getBudgets);
router.get('/alerts', budgetController.getBudgetAlerts);

router.post('/', 
    readOnlyCheck,
    roleCheck('admin', 'user'), 
    budgetValidation, 
    budgetController.createBudget
);

router.put('/:id', 
    readOnlyCheck,
    roleCheck('admin', 'user'), 
    budgetValidation, 
    budgetController.updateBudget
);

router.delete('/:id', 
    readOnlyCheck,
    roleCheck('admin', 'user'), 
    budgetController.deleteBudget
);

module.exports = router;