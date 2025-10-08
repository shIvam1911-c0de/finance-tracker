const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middleware/auth');
const { roleCheck, ownershipCheck, readOnlyCheck } = require('../middleware/roleCheck');
const { validateAndSanitize } = require('../middleware/security');

router.use(authMiddleware);
router.use(validateAndSanitize);
router.use(ownershipCheck);

// GET routes - accessible to all roles
router.get('/', accountController.getAccounts);
router.get('/summary', accountController.getAccountSummary);

// POST/PUT/DELETE routes - only admin and user roles
router.post('/', 
    readOnlyCheck,
    roleCheck('admin', 'user'),
    accountController.createAccount
);

router.put('/:id', 
    readOnlyCheck,
    roleCheck('admin', 'user'),
    accountController.updateAccount
);

router.delete('/:id', 
    readOnlyCheck,
    roleCheck('admin', 'user'),
    accountController.deleteAccount
);

module.exports = router;