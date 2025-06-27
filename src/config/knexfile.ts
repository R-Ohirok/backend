import dotenv from 'dotenv';
import { Knex } from 'knex';
dotenv.config();

const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
};

export default knexConfig;