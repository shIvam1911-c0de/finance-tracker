const jwt = require('jsonwebtoken');

module.exports = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '7d',
    
    generateToken: (payload) => {
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '7d'
        });
    },
    
    verifyToken: (token) => {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
};