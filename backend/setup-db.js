require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./config/database');

async function setupDatabase() {
    try {
        console.log('Setting up database...');
        
        // Read the schema file
        const schemaPath = path.join(__dirname, '..', 'database', 'init_schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute the schema
        await pool.query(schema);
        console.log('✅ Database schema created successfully');
        
        // Also run the additional schema updates
        const updatesPath = path.join(__dirname, '..', 'database', 'schema_updates.sql');
        const updates = fs.readFileSync(updatesPath, 'utf8');
        await pool.query(updates);
        console.log('✅ Database updates applied successfully');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
}

setupDatabase();