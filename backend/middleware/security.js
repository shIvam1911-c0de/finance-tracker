const validator = require('validator');

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return validator.escape(input.trim());
};

const validateAndSanitize = (req, res, next) => {
  // Sanitize all string inputs
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeInput(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

const validateTransaction = (req, res, next) => {
  const { type, category, amount, description } = req.body;

  if (!type || !['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Invalid transaction type' });
  }

  if (!category || typeof category !== 'string' || category.length > 50) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  if (description && description.length > 500) {
    return res.status(400).json({ error: 'Description too long' });
  }

  next();
};

const validateAuth = (req, res, next) => {
  const { email, password, username } = req.body;

  if (email && !validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (password && password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (username && (username.length < 3 || username.length > 50)) {
    return res.status(400).json({ error: 'Username must be 3-50 characters' });
  }

  next();
};

module.exports = {
  validateAndSanitize,
  validateTransaction,
  validateAuth
};