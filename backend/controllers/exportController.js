const pool = require('../config/database');
const { Parser } = require('json2csv');

exports.exportTransactions = async (req, res) => {
    try {
        const { format = 'csv', startDate, endDate, category, type } = req.query;
        
        let query = 'SELECT * FROM transactions WHERE user_id = $1';
        const params = [req.user.id];
        let paramCount = 1;
        
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
        
        if (category) {
            paramCount++;
            query += ` AND category = $${paramCount}`;
            params.push(category);
        }
        
        if (type) {
            paramCount++;
            query += ` AND type = $${paramCount}`;
            params.push(type);
        }
        
        query += ' ORDER BY date DESC';
        
        const result = await pool.query(query, params);
        
        if (format === 'csv') {
            const fields = ['id', 'type', 'category', 'amount', 'description', 'date', 'created_at'];
            const parser = new Parser({ fields });
            const csv = parser.parse(result.rows);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
            res.send(csv);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename=transactions.json');
            res.json(result.rows);
        }
    } catch (error) {
        console.error('Export transactions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.exportAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get comprehensive analytics data
        const [categoryBreakdown, monthlyTrends, yearlyOverview] = await Promise.all([
            pool.query(`
                SELECT 
                    category,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income
                FROM transactions
                WHERE user_id = $1
                GROUP BY category
                ORDER BY expense DESC
            `, [userId]),
            
            pool.query(`
                SELECT 
                    TO_CHAR(date, 'YYYY-MM') as month,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
                FROM transactions
                WHERE user_id = $1
                    AND date >= CURRENT_DATE - INTERVAL '12 months'
                GROUP BY TO_CHAR(date, 'YYYY-MM')
                ORDER BY month
            `, [userId]),
            
            pool.query(`
                SELECT 
                    EXTRACT(YEAR FROM date) as year,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
                FROM transactions
                WHERE user_id = $1
                GROUP BY EXTRACT(YEAR FROM date)
                ORDER BY year DESC
            `, [userId])
        ]);
        
        const analyticsData = {
            categoryBreakdown: categoryBreakdown.rows,
            monthlyTrends: monthlyTrends.rows,
            yearlyOverview: yearlyOverview.rows,
            exportDate: new Date().toISOString()
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=analytics.json');
        res.json(analyticsData);
    } catch (error) {
        console.error('Export analytics error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};