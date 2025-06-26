import { Client } from 'pg';

const DB_URL = 'postgres://postgres:roman1705@localhost:5432/postgres';

export const client = new Client({ connectionString: DB_URL });
