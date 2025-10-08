// RBAC Middleware - Role-based access control
const roleCheck = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: 'Access denied: No role found' });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Access denied: Insufficient permissions',
                requiredRoles: allowedRoles,
                userRole: req.user.role
            });
        }
        
        next();
    };
};

// Resource ownership check - users can only access their own data
const ownershipCheck = (req, res, next) => {
    // Admin can access all resources
    if (req.user.role === 'admin') {
        return next();
    }
    
    // For non-admin users, add user_id filter to queries
    req.userFilter = { user_id: req.user.id };
    next();
};

// Read-only check - prevents modifications for read-only users
const readOnlyCheck = (req, res, next) => {
    if (req.user.role === 'read-only' && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
        return res.status(403).json({ 
            error: 'Read-only users cannot modify data' 
        });
    }
    next();
};

module.exports = {
    roleCheck,
    ownershipCheck,
    readOnlyCheck
};