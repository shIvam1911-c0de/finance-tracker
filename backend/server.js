// backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const analyticsRoutes = require('./routes/analytics');
const userRoutes = require('./routes/users');
const budgetRoutes = require('./routes/budgets');
const exportRoutes = require('./routes/export');
const adminRoutes = require('./routes/admin');
const accountRoutes = require('./routes/accounts');
const recurringRoutes = require('./routes/recurring');
const goalsRoutes = require('./routes/goals');
const reportsRoutes = require('./routes/reports');
const { setupSwagger } = require('./swagger');

const app = express();

// Trust proxy for production deployments
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Swagger documentation
setupSwagger(app);

// Routes with RBAC
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', adminRoutes); // Admin-only routes
app.use('/api/accounts', accountRoutes); // Multi-account support
app.use('/api/recurring', recurringRoutes); // Recurring transactions
app.use('/api/goals', goalsRoutes); // Financial goals
app.use('/api/reports', reportsRoutes); // Advanced reports

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`CORS enabled for: ${allowedOrigins.join(', ')}`);
});