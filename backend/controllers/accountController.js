const pool = require('../config/database');
const { getCache, setCache, invalidateCache } = require('../utils/cache');

exports.getAccounts = async (req, res) => {
    try {
        const cacheKey = `accounts:${req.user.id}`;
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
                a.*,
                COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) as calculated_balance
            FROM accounts a
            LEFT JOIN transactions t ON a.id = t.account_id
            WHERE a.user_id = $1 AND a.is_active = true
            GROUP BY a.id
            ORDER BY a.created_at DESC
        `, [req.user.id]);
        
        await setCache(cacheKey, JSON.stringify(result.rows), 1800); // 30 min cache
        res.json(result.rows);
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createAccount = async (req, res) => {
    try {
        const { name, type, currency = 'USD', balance = 0 } = req.body;
        
        const result = await pool.query(
            'INSERT INTO accounts (user_id, name, type, currency, balance) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.id, name, type, currency, balance]
        );
        
        await invalidateCache(`accounts:${req.user.id}`);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create account error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, currency, balance, is_active } = req.body;
        
        const result = await pool.query(
            'UPDATE accounts SET name = $1, type = $2, currency = $3, balance = $4, is_active = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
            [name, type, currency, balance, is_active, id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }
        
        await invalidateCache(`accounts:${req.user.id}`);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update account error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if account has transactions
        const transactionCheck = await pool.query(
            'SELECT COUNT(*) FROM transactions WHERE account_id = $1',
            [id]
        );
        
        if (parseInt(transactionCheck.rows[0].count) > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete account with existing transactions' 
            });
        }
        
        const result = await pool.query(
            'DELETE FROM accounts WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }
        
        await invalidateCache(`accounts:${req.user.id}`);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getAccountSummary = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                a.currency,
                COUNT(*) as account_count,
                SUM(a.balance) as total_balance,
                SUM(CASE WHEN a.type = 'bank' THEN a.balance ELSE 0 END) as bank_balance,
                SUM(CASE WHEN a.type = 'credit_card' THEN a.balance ELSE 0 END) as credit_balance,
                SUM(CASE WHEN a.type = 'cash' THEN a.balance ELSE 0 END) as cash_balance,
                SUM(CASE WHEN a.type = 'investment' THEN a.balance ELSE 0 END) as investment_balance
            FROM accounts a
            WHERE a.user_id = $1 AND a.is_active = true
            GROUP BY a.currency
            ORDER BY a.currency
        `, [req.user.id]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Account summary error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};