const pool = require('../config/database');
const { getCache, setCache, invalidateCache } = require('../utils/cache');

exports.getBudgets = async (req, res) => {
    try {
        const cacheKey = `budgets:${req.user.id}`;
        const cached = await getCache(cacheKey);
        
        if (cached) {
            try {
                return res.json(typeof cached === 'string' ? JSON.parse(cached) : cached);
            } catch (e) {
                console.warn('Cache parse error:', e);
            }
        }

        const result = await pool.query(`
            SELECT 
                b.*,
                COALESCE(t.spent, 0) as spent,
                CASE 
                    WHEN b.amount > 0 THEN (COALESCE(t.spent, 0) / b.amount * 100)
                    ELSE 0 
                END as usage_percentage
            FROM budgets b
            LEFT JOIN (
                SELECT 
                    category,
                    SUM(amount) as spent
                FROM transactions 
                WHERE user_id = $1 
                    AND type = 'expense'
                    AND date >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY category
            ) t ON b.category = t.category
            WHERE b.user_id = $1 AND b.is_active = true
            ORDER BY b.created_at DESC
        `, [req.user.id]);
        
        await setCache(cacheKey, JSON.stringify(result.rows), 900);
        res.json(result.rows);
    } catch (error) {
        console.error('Get budgets error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createBudget = async (req, res) => {
    try {
        const { category, amount, period, currency = 'USD', start_date, end_date } = req.body;
        
        const result = await pool.query(
            'INSERT INTO budgets (user_id, category, amount, period, currency, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [req.user.id, category, amount, period, currency, start_date, end_date || null]
        );
        
        await invalidateCache(`budgets:${req.user.id}`);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create budget error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, amount, period, start_date, end_date } = req.body;
        
        const result = await pool.query(
            'UPDATE budgets SET category = $1, amount = $2, period = $3, start_date = $4, end_date = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
            [category, amount, period, start_date, end_date || null, id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Budget not found' });
        }
        
        await invalidateCache(`budgets:${req.user.id}`);
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update budget error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Budget not found' });
        }
        
        await invalidateCache(`budgets:${req.user.id}`);
        
        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        console.error('Delete budget error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getBudgetAlerts = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                b.category,
                b.amount as budget_amount,
                COALESCE(t.spent, 0) as spent,
                (COALESCE(t.spent, 0) / b.amount * 100) as usage_percentage
            FROM budgets b
            LEFT JOIN (
                SELECT 
                    category,
                    SUM(amount) as spent
                FROM transactions 
                WHERE user_id = $1 
                    AND type = 'expense'
                    AND date >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY category
            ) t ON b.category = t.category
            WHERE b.user_id = $1 
                AND b.is_active = true
                AND (COALESCE(t.spent, 0) / b.amount * 100) > 80
            ORDER BY usage_percentage DESC
        `, [req.user.id]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Get budget alerts error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};