const pool = require('../config/database');

exports.logActivity = async (userId, action, resource, details = null) => {
    try {
        await pool.query(
            'INSERT INTO audit_logs (user_id, action, resource, details, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, action, resource, details, null, null]
        );
    } catch (error) {
        console.error('Audit log error:', error);
    }
};

exports.getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, user_id, action, resource } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT al.*, u.username, u.email 
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 0;
        
        if (user_id) {
            paramCount++;
            query += ` AND al.user_id = $${paramCount}`;
            params.push(user_id);
        }
        
        if (action) {
            paramCount++;
            query += ` AND al.action = $${paramCount}`;
            params.push(action);
        }
        
        if (resource) {
            paramCount++;
            query += ` AND al.resource = $${paramCount}`;
            params.push(resource);
        }
        
        // Get total count
        const countResult = await pool.query(
            query.replace('SELECT al.*, u.username, u.email', 'SELECT COUNT(*)'),
            params
        );
        const total = parseInt(countResult.rows[0].count);
        
        // Get paginated results
        query += ` ORDER BY al.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(limit, offset);
        
        const result = await pool.query(query, params);
        
        res.json({
            logs: result.rows,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getUserActivity = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(`
            SELECT 
                action,
                resource,
                COUNT(*) as count,
                MAX(created_at) as last_activity
            FROM audit_logs 
            WHERE user_id = $1 
            GROUP BY action, resource
            ORDER BY last_activity DESC
        `, [id]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Get user activity error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};