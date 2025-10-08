const { logActivity } = require('../controllers/auditController');

const auditMiddleware = (action, resource) => {
    return async (req, res, next) => {
        const originalSend = res.send;
        
        res.send = function(data) {
            // Log successful operations (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const details = {
                    method: req.method,
                    url: req.originalUrl,
                    params: req.params,
                    body: req.method !== 'GET' ? req.body : undefined,
                    statusCode: res.statusCode
                };
                
                logActivity(
                    req.user?.id, 
                    action || req.method.toLowerCase(), 
                    resource || req.route?.path || req.originalUrl,
                    JSON.stringify(details)
                );
            }
            
            originalSend.call(this, data);
        };
        
        next();
    };
};

module.exports = auditMiddleware;