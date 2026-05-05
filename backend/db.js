const { Pool } = require('pg');

const pool = new Pool({
  user: 'admin',
  host: 'postgres',
  database: 'devopsdb',
  password: 'password',
  port: 5432,
});

module.exports = pool;
