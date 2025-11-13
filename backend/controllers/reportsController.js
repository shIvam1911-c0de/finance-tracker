const pool = require('../config/database');
const { Parser } = require('json2csv');

exports.getFinancialReport = async (req, res) => {
    try {
        const { startDate, endDate, format = 'json', currency = 'USD' } = req.query;
        
        // Income vs Expenses
        const incomeExpenses = await pool.query(`
            SELECT 
                type,
                SUM(amount) as total,
                COUNT(*) as count
            FROM transactions 
            WHERE user_id = $1 
                AND date BETWEEN $2 AND $3
            GROUP BY type
        `, [req.user.id, startDate, endDate]);
        
        // Category breakdown
        const categoryBreakdown = await pool.query(`
            SELECT 
                category,
                type,
                SUM(amount) as total,
                COUNT(*) as count
            FROM transactions 
            WHERE user_id = $1 
                AND date BETWEEN $2 AND $3
            GROUP BY category, type
            ORDER BY total DESC
        `, [req.user.id, startDate, endDate]);
        
        // Monthly trends
        const monthlyTrends = await pool.query(`
            SELECT 
                TO_CHAR(date, 'YYYY-MM') as month,
                type,
                SUM(amount) as total
            FROM transactions 
            WHERE user_id = $1 
                AND date BETWEEN $2 AND $3
            GROUP BY TO_CHAR(date, 'YYYY-MM'), type
            ORDER BY month
        `, [req.user.id, startDate, endDate]);
        
        // Account balances
        const accountBalances = await pool.query(`
            SELECT 
                a.name,
                a.type,
                a.currency,
                a.balance
            FROM accounts a
            WHERE a.user_id = $1 AND a.is_active = true
        `, [req.user.id]);
        
        const report = {
            period: { startDate, endDate },
            currency,
            summary: {
                totalIncome: incomeExpenses.rows.find(r => r.type === 'income')?.total || 0,
                totalExpenses: incomeExpenses.rows.find(r => r.type === 'expense')?.total || 0,
                netIncome: (incomeExpenses.rows.find(r => r.type === 'income')?.total || 0) - 
                          (incomeExpenses.rows.find(r => r.type === 'expense')?.total || 0),
                transactionCount: incomeExpenses.rows.reduce((sum, r) => sum + parseInt(r.count), 0)
            },
            categoryBreakdown: categoryBreakdown.rows,
            monthlyTrends: monthlyTrends.rows,
            accountBalances: accountBalances.rows,
            generatedAt: new Date().toISOString()
        };
        
        if (format === 'csv') {
            const fields = [
                'category', 'type', 'total', 'count'
            ];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(categoryBreakdown.rows);
            
            res.header('Content-Type', 'text/csv');
            res.attachment(`financial-report-${startDate}-${endDate}.csv`);
            return res.send(csv);
        }
        
        res.json(report);
    } catch (error) {
        console.error('Financial report error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getTaxReport = async (req, res) => {
    try {
        const { year, currency = 'USD' } = req.query;
        
        const result = await pool.query(`
            SELECT 
                category,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
                COUNT(*) as transaction_count
            FROM transactions 
            WHERE user_id = $1 
                AND EXTRACT(YEAR FROM date) = $2
            GROUP BY category
            ORDER BY (income + expenses) DESC
        `, [req.user.id, year]);
        
        const summary = await pool.query(`
            SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
            FROM transactions 
            WHERE user_id = $1 
                AND EXTRACT(YEAR FROM date) = $2
        `, [req.user.id, year]);
        
        res.json({
            year: parseInt(year),
            currency,
            summary: summary.rows[0],
            categories: result.rows,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Tax report error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getBudgetReport = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                b.category,
                b.amount as budget_amount,
                b.period,
                b.currency,
                COALESCE(t.spent, 0) as actual_spent,
                (b.amount - COALESCE(t.spent, 0)) as remaining,
                CASE 
                    WHEN b.amount > 0 THEN (COALESCE(t.spent, 0) / b.amount * 100)
                    ELSE 0 
                END as usage_percentage,
                CASE 
                    WHEN COALESCE(t.spent, 0) > b.amount THEN 'Over Budget'
                    WHEN COALESCE(t.spent, 0) > (b.amount * 0.8) THEN 'Near Limit'
                    ELSE 'On Track'
                END as status
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
            ORDER BY usage_percentage DESC
        `, [req.user.id]);
        
        res.json({
            budgets: result.rows,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Budget report error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};