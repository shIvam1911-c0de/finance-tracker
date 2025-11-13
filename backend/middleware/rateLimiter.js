const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

const transactionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 500,
    message: 'Too many transaction requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

const analyticsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 200,
    message: 'Too many analytics requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authLimiter,
    transactionLimiter,
    analyticsLimiter
};