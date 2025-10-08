const pool = require('../config/database');
const { invalidateCache } = require('../utils/cache');

exports.getRecurringTransactions = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                rt.*,
                a.name as account_name
            FROM recurring_transactions rt
            LEFT JOIN accounts a ON rt.account_id = a.id
            WHERE rt.user_id = $1 AND rt.is_active = true
            ORDER BY rt.next_execution ASC
        `, [req.user.id]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Get recurring transactions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createRecurringTransaction = async (req, res) => {
    try {
        const { 
            account_id, 
            type, 
            category, 
            amount, 
            currency = 'USD',
            description, 
            frequency, 
            start_date, 
            end_date 
        } = req.body;
        
        // Calculate next execution date
        const nextExecution = calculateNextExecution(start_date, frequency);
        
        const result = await pool.query(`
            INSERT INTO recurring_transactions 
            (user_id, account_id, type, category, amount, currency, description, frequency, start_date, end_date, next_execution) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING *
        `, [req.user.id, account_id, type, category, amount, currency, description, frequency, start_date, end_date || null, nextExecution]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create recurring transaction error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateRecurringTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            account_id, 
            type, 
            category, 
            amount, 
            currency,
            description, 
            frequency, 
            start_date, 
            end_date,
            is_active 
        } = req.body;
        
        const result = await pool.query(`
            UPDATE recurring_transactions 
            SET account_id = $1, type = $2, category = $3, amount = $4, currency = $5, 
                description = $6, frequency = $7, start_date = $8, end_date = $9, is_active = $10
            WHERE id = $11 AND user_id = $12 
            RETURNING *
        `, [account_id, type, category, amount, currency, description, frequency, start_date, end_date || null, is_active, id, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Recurring transaction not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update recurring transaction error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteRecurringTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM recurring_transactions WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Recurring transaction not found' });
        }
        
        res.json({ message: 'Recurring transaction deleted successfully' });
    } catch (error) {
        console.error('Delete recurring transaction error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Process due recurring transactions
exports.processDueTransactions = async (req, res) => {
    try {
        const dueTransactions = await pool.query(`
            SELECT * FROM recurring_transactions 
            WHERE next_execution <= CURRENT_DATE 
                AND is_active = true
                AND (end_date IS NULL OR end_date >= CURRENT_DATE)
        `);
        
        let processedCount = 0;
        
        for (const recurring of dueTransactions.rows) {
            // Create actual transaction
            await pool.query(`
                INSERT INTO transactions (user_id, account_id, type, category, amount, currency, description, date)
                VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE)
            `, [
                recurring.user_id,
                recurring.account_id,
                recurring.type,
                recurring.category,
                recurring.amount,
                recurring.currency,
                `${recurring.description} (Auto-generated)`
            ]);
            
            // Update next execution date
            const nextExecution = calculateNextExecution(recurring.next_execution, recurring.frequency);
            await pool.query(
                'UPDATE recurring_transactions SET next_execution = $1 WHERE id = $2',
                [nextExecution, recurring.id]
            );
            
            // Invalidate user caches
            await invalidateCache(`analytics:${recurring.user_id}:*`);
            await invalidateCache(`dashboard:${recurring.user_id}`);
            
            processedCount++;
        }
        
        res.json({ 
            message: `Processed ${processedCount} recurring transactions`,
            processed: processedCount 
        });
    } catch (error) {
        console.error('Process recurring transactions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Helper function to calculate next execution date
function calculateNextExecution(currentDate, frequency) {
    const date = new Date(currentDate);
    
    switch (frequency) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
        default:
            date.setMonth(date.getMonth() + 1); // Default to monthly
    }
    
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}