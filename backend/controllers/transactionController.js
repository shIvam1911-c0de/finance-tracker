const pool = require('../config/database');
const { invalidateCache } = require('../utils/cache');

exports.getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, type, category, search, startDate, endDate, userId } = req.query;
        const offset = (page - 1) * limit;
        
        // RBAC: Admin can view all transactions, others only their own
        let query = 'SELECT * FROM transactions WHERE 1=1';
        const params = [];
        let paramCount = 0;
        
        // Apply user filter based on role
        if (req.user.role === 'admin' && userId) {
            // Admin viewing specific user's transactions
            paramCount++;
            query += ` AND user_id = $${paramCount}`;
            params.push(userId);
        } else if (req.user.role !== 'admin') {
            // Non-admin users can only see their own transactions
            paramCount++;
            query += ` AND user_id = $${paramCount}`;
            params.push(req.user.id);
        }
        
        if (type) {
            paramCount++;
            query += ` AND type = $${paramCount}`;
            params.push(type);
        }
        
        if (category) {
            paramCount++;
            query += ` AND category = $${paramCount}`;
            params.push(category);
        }
        
        if (search) {
            paramCount++;
            query += ` AND description ILIKE $${paramCount}`;
            params.push(`%${search}%`);
        }
        
        if (startDate) {
            paramCount++;
            query += ` AND date >= $${paramCount}`;
            params.push(startDate);
        }
        
        if (endDate) {
            paramCount++;
            query += ` AND date <= $${paramCount}`;
            params.push(endDate);
        }
        
        // Get total count
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);
        
        // Get paginated results
        query += ` ORDER BY date DESC, created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(limit, offset);
        
        const result = await pool.query(query, params);
        
        res.json({
            transactions: result.rows,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createTransaction = async (req, res) => {
    try {
        const { type, category, amount, description, date } = req.body;
        
        const result = await pool.query(
            'INSERT INTO transactions (user_id, type, category, amount, description, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.id, type, category, amount, description, date]
        );
        
        // Invalidate cache
        await invalidateCache(`analytics:${req.user.id}:*`);
        await invalidateCache(`dashboard:${req.user.id}`);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, category, amount, description, date } = req.body;
        
        const result = await pool.query(
            'UPDATE transactions SET type = $1, category = $2, amount = $3, description = $4, date = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
            [type, category, amount, description, date, id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        // Invalidate cache
        await invalidateCache(`analytics:${req.user.id}:*`);
        await invalidateCache(`dashboard:${req.user.id}`);
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        // Invalidate cache
        await invalidateCache(`analytics:${req.user.id}:*`);
        await invalidateCache(`dashboard:${req.user.id}`);
        
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT DISTINCT category FROM transactions WHERE user_id = $1 ORDER BY category',
            [req.user.id]
        );
        
        res.json(result.rows.map(row => row.category));
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};