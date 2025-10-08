const pool = require('../config/database');
const { invalidateCache } = require('../utils/cache');

// Admin: Get all transactions across all users
exports.getAllTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 20, userId, type, category } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT t.*, u.username, u.email 
            FROM transactions t 
            JOIN users u ON t.user_id = u.id 
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 0;
        
        if (userId) {
            paramCount++;
            query += ` AND t.user_id = $${paramCount}`;
            params.push(userId);
        }
        
        if (type) {
            paramCount++;
            query += ` AND t.type = $${paramCount}`;
            params.push(type);
        }
        
        if (category) {
            paramCount++;
            query += ` AND t.category = $${paramCount}`;
            params.push(category);
        }
        
        // Get total count
        const countResult = await pool.query(
            query.replace('SELECT t.*, u.username, u.email', 'SELECT COUNT(*)'),
            params
        );
        const total = parseInt(countResult.rows[0].count);
        
        // Get paginated results
        query += ` ORDER BY t.date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
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
        console.error('Admin get all transactions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Admin: Delete any transaction
exports.deleteAnyTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM transactions WHERE id = $1 RETURNING user_id',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        // Invalidate cache for the transaction owner
        const userId = result.rows[0].user_id;
        await invalidateCache(`analytics:${userId}:*`);
        await invalidateCache(`dashboard:${userId}`);
        
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Admin delete transaction error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Admin: Get user statistics
exports.getUserStats = async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
                COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count,
                COUNT(CASE WHEN role = 'read-only' THEN 1 END) as readonly_count
            FROM users
        `);
        
        const transactionStats = await pool.query(`
            SELECT 
                COUNT(*) as total_transactions,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
            FROM transactions
        `);
        
        res.json({
            users: stats.rows[0],
            transactions: transactionStats.rows[0]
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = exports;