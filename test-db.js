const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

console.log('Testing connection to:', connectionString?.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({ connectionString });

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connection successful!');
        console.log('Server time:', res.rows[0].now);
        pool.end();
    }
});
