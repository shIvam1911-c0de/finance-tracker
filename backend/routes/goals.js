const express = require('express');
const router = express.Router();
const goalsController = require('../controllers/goalsController');
const authMiddleware = require('../middleware/auth');
const { roleCheck, ownershipCheck, readOnlyCheck } = require('../middleware/roleCheck');
const { validateAndSanitize } = require('../middleware/security');

router.use(authMiddleware);
router.use(validateAndSanitize);
router.use(ownershipCheck);

// GET routes - accessible to all roles
router.get('/', goalsController.getGoals);
router.get('/summary', goalsController.getGoalsSummary);

// POST/PUT/DELETE routes - only admin and user roles
router.post('/', 
    readOnlyCheck,
    roleCheck('admin', 'user'),
    goalsController.createGoal
);

router.put('/:id', 
    readOnlyCheck,
    roleCheck('admin', 'user'),
    goalsController.updateGoal
);

router.put('/:id/progress', 
    readOnlyCheck,
    roleCheck('admin', 'user'),
    goalsController.updateGoalProgress
);

router.delete('/:id', 
    readOnlyCheck,
    roleCheck('admin', 'user'),
    goalsController.deleteGoal
);

module.exports = router;