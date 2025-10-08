const pool = require('../config/database');
const { invalidateCache } = require('../utils/cache');

exports.getDepartments = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.*, u.username as manager_name 
            FROM departments d
            LEFT JOIN users u ON d.manager_id = u.id
            ORDER BY d.name
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createDepartment = async (req, res) => {
    try {
        const { name, budget_limit, manager_id } = req.body;
        
        const result = await pool.query(
            'INSERT INTO departments (name, budget_limit, manager_id) VALUES ($1, $2, $3) RETURNING *',
            [name, budget_limit, manager_id]
        );
        
        await invalidateCache('departments:*');
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create department error:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Department name already exists' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, budget_limit, manager_id } = req.body;
        
        const result = await pool.query(
            'UPDATE departments SET name = $1, budget_limit = $2, manager_id = $3 WHERE id = $4 RETURNING *',
            [name, budget_limit, manager_id, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }
        
        await invalidateCache('departments:*');
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update department error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM departments WHERE id = $1 RETURNING name',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }
        
        await invalidateCache('departments:*');
        
        res.json({ message: `Department ${result.rows[0].name} deleted successfully` });
    } catch (error) {
        console.error('Delete department error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getDepartmentBudgetAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(`
            SELECT 
                d.*,
                COALESCE(SUM(t.amount), 0) as total_spent,
                (d.budget_limit - COALESCE(SUM(t.amount), 0)) as remaining_budget,
                CASE 
                    WHEN d.budget_limit > 0 THEN (COALESCE(SUM(t.amount), 0) / d.budget_limit * 100)
                    ELSE 0 
                END as budget_utilization
            FROM departments d
            LEFT JOIN transactions t ON d.id = t.department_id 
                AND t.type = 'expense'
                AND EXTRACT(MONTH FROM t.date) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM t.date) = EXTRACT(YEAR FROM CURRENT_DATE)
            WHERE d.id = $1
            GROUP BY d.id
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Department budget analysis error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.assignUserToDepartment = async (req, res) => {
    try {
        const { departmentId, userId } = req.params;
        const { role = 'member' } = req.body;
        
        const result = await pool.query(
            'INSERT INTO user_departments (user_id, department_id, role) VALUES ($1, $2, $3) ON CONFLICT (user_id, department_id) DO UPDATE SET role = $3 RETURNING *',
            [userId, departmentId, role]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Assign user to department error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};