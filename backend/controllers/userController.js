const pool = require('../config/database');

exports.getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!['admin', 'user', 'read-only'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        
        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, email, role',
            [role, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Prevent deleting yourself
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING username',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: `User ${result.rows[0].username} deleted successfully` });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};