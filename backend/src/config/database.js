import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log(' Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error(' Unexpected error on idle PostgreSQL client', err);
});


export const query = (text, params) => pool.query(text, params);

const db = {
  query,
  pool,
};

export default db;
