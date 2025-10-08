const pool = require('../config/database');
const { getCache, setCache, invalidateCache } = require('../utils/cache');

exports.getGoals = async (req, res) => {
    try {
        const cacheKey = `goals:${req.user.id}`;
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
                *,
                CASE 
                    WHEN target_amount > 0 THEN (current_amount / target_amount * 100)
                    ELSE 0 
                END as progress_percentage,
                CASE 
                    WHEN target_date IS NOT NULL THEN (target_date - CURRENT_DATE)
                    ELSE NULL 
                END as days_remaining
            FROM financial_goals 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `, [req.user.id]);
        
        await setCache(cacheKey, JSON.stringify(result.rows), 1800); // 30 min cache
        res.json(result.rows);
    } catch (error) {
        console.error('Get goals error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createGoal = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            target_amount, 
            current_amount = 0,
            currency = 'USD',
            target_date, 
            category 
        } = req.body;
        
        const result = await pool.query(`
            INSERT INTO financial_goals 
            (user_id, title, description, target_amount, current_amount, currency, target_date, category) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *
        `, [req.user.id, title, description, target_amount, current_amount, currency, target_date || null, category]);
        
        await invalidateCache(`goals:${req.user.id}`);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, 
            description, 
            target_amount, 
            current_amount,
            currency,
            target_date, 
            category,
            is_achieved 
        } = req.body;
        
        const result = await pool.query(`
            UPDATE financial_goals 
            SET title = $1, description = $2, target_amount = $3, current_amount = $4, 
                currency = $5, target_date = $6, category = $7, is_achieved = $8
            WHERE id = $9 AND user_id = $10 
            RETURNING *
        `, [title, description, target_amount, current_amount, currency, target_date || null, category, is_achieved, id, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        
        await invalidateCache(`goals:${req.user.id}`);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM financial_goals WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        
        await invalidateCache(`goals:${req.user.id}`);
        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateGoalProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        
        const result = await pool.query(`
            UPDATE financial_goals 
            SET current_amount = current_amount + $1,
                is_achieved = CASE 
                    WHEN (current_amount + $1) >= target_amount THEN true 
                    ELSE false 
                END
            WHERE id = $2 AND user_id = $3 
            RETURNING *
        `, [amount, id, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        
        await invalidateCache(`goals:${req.user.id}`);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update goal progress error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getGoalsSummary = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_goals,
                COUNT(CASE WHEN is_achieved = true THEN 1 END) as achieved_goals,
                COUNT(CASE WHEN is_achieved = false THEN 1 END) as active_goals,
                SUM(target_amount) as total_target,
                SUM(current_amount) as total_saved,
                AVG(CASE WHEN target_amount > 0 THEN (current_amount / target_amount * 100) ELSE 0 END) as avg_progress
            FROM financial_goals 
            WHERE user_id = $1
        `, [req.user.id]);
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Goals summary error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};