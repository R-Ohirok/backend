/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('token_blacklist', (table) => {
    table.increments('id').primary();
    table.text('token').notNullable();
    table.bigInteger('expires_at').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable('token_blacklist');
};
