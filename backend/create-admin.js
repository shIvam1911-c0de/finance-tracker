require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const result = await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
            ['admin', 'admin@finance.com', hashedPassword, 'admin']
        );
        
        console.log('✅ Admin user created:', result.rows[0]);
        console.log('📧 Email: admin@finance.com');
        console.log('🔑 Password: admin123');
        process.exit(0);
    } catch (error) {
        if (error.code === '23505') {
            console.log('⚠️ Admin user already exists');
        } else {
            console.error('❌ Error creating admin:', error);
        }
        process.exit(1);
    }
}

createAdmin();