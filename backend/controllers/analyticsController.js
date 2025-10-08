const pool = require('../config/database');
const { getCache, setCache } = require('../utils/cache');

exports.getAnalytics = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const cacheKey = `analytics:${req.user.id}:${period}`;
        
        // Check cache
        const cached = await getCache(cacheKey);
        if (cached) {
            try {
                const parsedCache = typeof cached === 'string' ? JSON.parse(cached) : cached;
                return res.json(parsedCache);
            } catch (e) {
                console.warn('Cache parse error, ignoring cache:', e);
            }
        }
        
        const userId = req.user.id;
        
        // Get category breakdown
        const categoryBreakdown = await pool.query(
            `SELECT 
                category,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income
            FROM transactions
            WHERE user_id = $1
            GROUP BY category
            ORDER BY expense DESC`,
            [userId]
        );
        
        // Get monthly trends
        const monthlyTrends = await pool.query(
            `SELECT 
                TO_CHAR(date, 'YYYY-MM') as month,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
            FROM transactions
            WHERE user_id = $1
                AND date >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY TO_CHAR(date, 'YYYY-MM')
            ORDER BY month`,
            [userId]
        );
        
        // Get yearly overview
        const yearlyOverview = await pool.query(
            `SELECT 
                EXTRACT(YEAR FROM date) as year,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
            FROM transactions
            WHERE user_id = $1
            GROUP BY EXTRACT(YEAR FROM date)
            ORDER BY year DESC
            LIMIT 5`,
            [userId]
        );
        
        // Get total income and expenses
        const totals = await pool.query(
            `SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
                COUNT(*) as total_transactions
            FROM transactions
            WHERE user_id = $1`,
            [userId]
        );
        
        const analytics = {
            categoryBreakdown: categoryBreakdown.rows,
            monthlyTrends: monthlyTrends.rows,
            yearlyOverview: yearlyOverview.rows,
            totals: totals.rows[0],
            balance: parseFloat(totals.rows[0].total_income || 0) - parseFloat(totals.rows[0].total_expense || 0)
        };
        
        // Cache for 15 minutes
        await setCache(cacheKey, JSON.stringify(analytics), 900);
        
        res.json(analytics);
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const cacheKey = `dashboard:${req.user.id}`;
        
        // Check cache
        const cached = await getCache(cacheKey);
        if (cached) {
            try {
                const parsedCache = typeof cached === 'string' ? JSON.parse(cached) : cached;
                return res.json(parsedCache);
            } catch (e) {
                console.warn('Cache parse error, ignoring cache:', e);
            }
        }
        
        const userId = req.user.id;
        
        // Current month stats
        const currentMonth = await pool.query(
            `SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
                COUNT(*) as transaction_count
            FROM transactions
            WHERE user_id = $1
                AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
            [userId]
        );
        
        // Previous month stats
        const previousMonth = await pool.query(
            `SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
            FROM transactions
            WHERE user_id = $1
                AND date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                AND date < DATE_TRUNC('month', CURRENT_DATE)`,
            [userId]
        );
        
        // Recent transactions
        const recentTransactions = await pool.query(
            `SELECT * FROM transactions 
            WHERE user_id = $1 
            ORDER BY date DESC, created_at DESC 
            LIMIT 5`,
            [userId]
        );
        
        const currentIncome = parseFloat(currentMonth.rows[0].income || 0);
        const currentExpense = parseFloat(currentMonth.rows[0].expense || 0);
        
        const stats = {
            currentMonth: currentMonth.rows[0],
            previousMonth: previousMonth.rows[0],
            recentTransactions: recentTransactions.rows,
            savingsRate: currentIncome > 0 
                ? ((currentIncome - currentExpense) / currentIncome * 100).toFixed(2)
                : 0
        };
        
        // Cache for 15 minutes
        await setCache(cacheKey, JSON.stringify(stats), 900);
        
        res.json(stats);
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};